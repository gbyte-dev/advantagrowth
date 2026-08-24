<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\RestaurantHoliday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (
            !$user ||
            !$user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $restaurant = $user->restaurant;

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'year' => [
                'nullable',
                'integer',
                'min:2026',
                'max:2030',
            ],
        ]);

        $year =
            isset($validated['year'])
                ? (int) $validated['year']
                : (int) now()->year;

        $country = trim(
            (string) $restaurant->country
        );

        if ($country === '') {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant country is missing. Please update Restaurant Profile first.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Resolve country from Tallyfy country index
        |--------------------------------------------------------------------------
        */

        $countryInfo =
            $this->resolveCountry(
                $country
            );

        if (!$countryInfo) {
            return response()->json([
                'success' => false,
                'message' =>
                    "Unable to determine holiday country code for '{$country}'.",
            ], 422);
        }

        $countryCode =
            strtoupper(
                (string)
                (
                    $countryInfo['code']
                    ?? ''
                )
            );

        $resolvedCountryName =
            (string)
            (
                $countryInfo['name']
                ?? $country
            );

        if ($countryCode === '') {
            return response()->json([
                'success' => false,
                'message' =>
                    "Unable to determine holiday country code for '{$country}'.",
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Fetch national holidays
        |--------------------------------------------------------------------------
        */

        $publicHolidays = [];
        $providerMessage = null;

        try {
            $response =
                Http::acceptJson()
                    ->timeout(12)
                    ->retry(
                        2,
                        300
                    )
                    ->get(
                        "https://tallyfy.com/national-holidays/api/{$countryCode}/{$year}.json"
                    );

            if (
                !$response->successful()
            ) {
                $providerMessage =
                    'Holiday provider returned an error.';
            } else {
                $rawHolidays =
                    $response->json(
                        'holidays',
                        []
                    );

                if (
                    is_array(
                        $rawHolidays
                    )
                ) {
                    $publicHolidays =
                        collect(
                            $rawHolidays
                        )
                            ->filter(
                                function (
                                    $holiday
                                ) {
                                    return
                                        !empty(
                                            $holiday['date']
                                        );
                                }
                            )
                            ->map(
                                function (
                                    $holiday
                                ) use (
                                    $countryCode
                                ) {
                                    return [
                                        'id' =>
                                            null,

                                        'source' =>
                                            'public',

                                        'date' =>
                                            $holiday['date']
                                            ?? null,

                                        'local_name' =>
                                            $holiday['local_name']
                                            ?? $holiday['name']
                                            ?? null,

                                        'name' =>
                                            $holiday['name']
                                            ?? null,

                                        'country_code' =>
                                            $countryCode,

                                        'fixed' =>
                                            false,

                                        'global' =>
                                            true,

                                        'counties' =>
                                            null,

                                        'launch_year' =>
                                            null,

                                        'types' => [
                                            $holiday['type']
                                            ?? 'national',
                                        ],

                                        'notes' =>
                                            $holiday['description']
                                            ?? null,

                                        'is_closed' =>
                                            true,

                                        'observed_date' =>
                                            $holiday['observed_date']
                                            ?? null,

                                        'is_observed_shifted' =>
                                            (bool)
                                            (
                                                $holiday['is_observed_shifted']
                                                ?? false
                                            ),
                                    ];
                                }
                            )
                            ->sortBy(
                                'date'
                            )
                            ->values()
                            ->all();
                }

                if (
                    count(
                        $publicHolidays
                    ) === 0
                ) {
                    $providerMessage =
                        'No national holidays were returned for this country and year.';
                }
            }
        } catch (\Throwable $exception) {
            $providerMessage =
                'Unable to connect to the holiday provider.';
        }

        /*
        |--------------------------------------------------------------------------
        | Custom restaurant holidays
        |--------------------------------------------------------------------------
        */

        $customHolidays =
            RestaurantHoliday::query()
                ->where(
                    'restaurant_id',
                    $restaurant->id
                )
                ->whereYear(
                    'holiday_date',
                    $year
                )
                ->orderBy(
                    'holiday_date'
                )
                ->get()
                ->map(
                    function (
                        RestaurantHoliday $holiday
                    ) {
                        return [
                            'id' =>
                                $holiday->id,

                            'source' =>
                                'custom',

                            'date' =>
                                $holiday
                                    ->holiday_date
                                    ->toDateString(),

                            'local_name' =>
                                $holiday->name,

                            'name' =>
                                $holiday->name,

                            'country_code' =>
                                null,

                            'fixed' =>
                                false,

                            'global' =>
                                false,

                            'counties' =>
                                null,

                            'launch_year' =>
                                null,

                            'types' => [
                                $holiday->type,
                            ],

                            'notes' =>
                                $holiday->notes,

                            'is_closed' =>
                                $holiday->is_closed,

                            'observed_date' =>
                                null,

                            'is_observed_shifted' =>
                                false,
                        ];
                    }
                )
                ->values()
                ->all();

        /*
        |--------------------------------------------------------------------------
        | Merge public + custom
        |--------------------------------------------------------------------------
        */

        $holidays =
            collect(
                array_merge(
                    $publicHolidays,
                    $customHolidays
                )
            )
                ->sortBy(
                    'date'
                )
                ->values()
                ->all();

        return response()->json([
            'success' => true,

            'restaurant' => [
                'id' =>
                    $restaurant->id,

                'name' =>
                    $restaurant->name,

                'country' =>
                    $resolvedCountryName,

                'country_code' =>
                    $countryCode,

                'profile_country' =>
                    $country,
            ],

            'year' =>
                $year,

            'provider' =>
                'Tallyfy National Holidays',

            'provider_message' =>
                $providerMessage,

            'public_holidays' =>
                $publicHolidays,

            'custom_holidays' =>
                $customHolidays,

            'holidays' =>
                $holidays,

            'public_count' =>
                count(
                    $publicHolidays
                ),

            'custom_count' =>
                count(
                    $customHolidays
                ),

            'count' =>
                count(
                    $holidays
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Resolve country dynamically
    |--------------------------------------------------------------------------
    */

    private function resolveCountry(
        string $country
    ): ?array {
        try {
            $countries =
                Cache::remember(
                    'tallyfy.holiday_countries',
                    now()->addDay(),
                    function () {
                        $response =
                            Http::acceptJson()
                                ->timeout(12)
                                ->retry(
                                    2,
                                    300
                                )
                                ->get(
                                    'https://tallyfy.com/national-holidays/api/index.json'
                                );

                        if (
                            !$response
                                ->successful()
                        ) {
                            return [];
                        }

                        $data =
                            $response->json();

                        if (
                            isset(
                                $data['countries']
                            ) &&
                            is_array(
                                $data['countries']
                            )
                        ) {
                            return
                                $data['countries'];
                        }

                        return
                            is_array($data)
                                ? $data
                                : [];
                    }
                );
        } catch (\Throwable $exception) {
            return null;
        }

        if (
            !is_array(
                $countries
            ) ||
            count(
                $countries
            ) === 0
        ) {
            return null;
        }

        $input =
            strtolower(
                trim(
                    $country
                )
            );

        /*
         * Direct name/code match.
         */

        foreach (
            $countries
            as $item
        ) {
            if (
                !is_array(
                    $item
                )
            ) {
                continue;
            }

            $code =
                strtolower(
                    trim(
                        (string)
                        (
                            $item['code']
                            ?? $item['country_code']
                            ?? $item['iso2']
                            ?? ''
                        )
                    )
                );

            $name =
                strtolower(
                    trim(
                        (string)
                        (
                            $item['name']
                            ?? $item['country']
                            ?? $item['country_name']
                            ?? ''
                        )
                    )
                );

            if (
                $input === $code ||
                $input === $name
            ) {
                return [
                    'code' =>
                        strtoupper(
                            $code
                        ),

                    'name' =>
                        $item['name']
                        ?? $item['country']
                        ?? $item['country_name']
                        ?? $country,
                ];
            }
        }

        /*
         * Common aliases.
         */

        $aliases = [
            'usa' =>
                'united states',

            'us' =>
                'united states',

            'uk' =>
                'united kingdom',

            'great britain' =>
                'united kingdom',

            'uae' =>
                'united arab emirates',

            'south korea' =>
                'south korea',
        ];

        if (
            isset(
                $aliases[$input]
            )
        ) {
            $wanted =
                $aliases[$input];

            foreach (
                $countries
                as $item
            ) {
                if (
                    !is_array(
                        $item
                    )
                ) {
                    continue;
                }

                $name =
                    strtolower(
                        trim(
                            (string)
                            (
                                $item['name']
                                ?? $item['country']
                                ?? $item['country_name']
                                ?? ''
                            )
                        )
                    );

                if (
                    $name ===
                    $wanted
                ) {
                    $code =
                        $item['code']
                        ?? $item['country_code']
                        ?? $item['iso2']
                        ?? null;

                    if (!$code) {
                        return null;
                    }

                    return [
                        'code' =>
                            strtoupper(
                                (string)
                                $code
                            ),

                        'name' =>
                            $item['name']
                            ?? $item['country']
                            ?? $item['country_name']
                            ?? $country,
                    ];
                }
            }
        }

        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Add custom holiday
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ) {
        $user =
            $request->user();

        if (
            !$user ||
            !$user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant not found.',
            ], 404);
        }

        $validated =
            $request->validate([
                'name' =>
                    'required|string|max:255',

                'holiday_date' =>
                    'required|date_format:Y-m-d',

                'type' =>
                    'nullable|string|max:50',

                'notes' =>
                    'nullable|string|max:1000',

                'is_closed' =>
                    'nullable|boolean',
            ]);

        $holiday =
            RestaurantHoliday::create([
                'restaurant_id' =>
                    $user->restaurant_id,

                'name' =>
                    $validated['name'],

                'holiday_date' =>
                    $validated[
                        'holiday_date'
                    ],

                'type' =>
                    $validated['type']
                    ?? 'custom',

                'notes' =>
                    $validated['notes']
                    ?? null,

                'is_closed' =>
                    $validated['is_closed']
                    ?? true,
            ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Holiday added successfully.',

            'holiday' =>
                $holiday,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update custom holiday
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        int $id
    ) {
        $user =
            $request->user();

        if (
            !$user ||
            !$user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant not found.',
            ], 404);
        }

        $holiday =
            RestaurantHoliday::query()
                ->where(
                    'restaurant_id',
                    $user->restaurant_id
                )
                ->find(
                    $id
                );

        if (!$holiday) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Holiday not found.',
            ], 404);
        }

        $validated =
            $request->validate([
                'name' =>
                    'required|string|max:255',

                'holiday_date' =>
                    'required|date_format:Y-m-d',

                'type' =>
                    'nullable|string|max:50',

                'notes' =>
                    'nullable|string|max:1000',

                'is_closed' =>
                    'nullable|boolean',
            ]);

        $holiday->update(
            $validated
        );

        return response()->json([
            'success' => true,

            'message' =>
                'Holiday updated successfully.',

            'holiday' =>
                $holiday->fresh(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete custom holiday
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        int $id
    ) {
        $user =
            $request->user();

        if (
            !$user ||
            !$user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant not found.',
            ], 404);
        }

        $holiday =
            RestaurantHoliday::query()
                ->where(
                    'restaurant_id',
                    $user->restaurant_id
                )
                ->find(
                    $id
                );

        if (!$holiday) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Holiday not found.',
            ], 404);
        }

        $holiday->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Holiday deleted successfully.',
        ]);
    }
}