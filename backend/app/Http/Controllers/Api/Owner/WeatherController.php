<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function overview(Request $request)
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

        /*
        |--------------------------------------------------------------------------
        | Restaurant location
        |--------------------------------------------------------------------------
        */

        $city = trim(
            (string) $restaurant->city
        );

        $country = trim(
            (string) $restaurant->country
        );

        $postalCode = trim(
            (string) $restaurant->postal_code
        );

        if (
            $city === '' &&
            $postalCode === ''
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant city or postal code is missing. Please update the Restaurant Profile first.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Build geocoding search terms
        |--------------------------------------------------------------------------
        */

        $searchTerms = [];

        if ($city !== '') {
            $searchTerms[] = $city;
        }

        if ($postalCode !== '') {
            $searchTerms[] = $postalCode;
        }

        if (
            $city !== '' &&
            $country !== ''
        ) {
            $searchTerms[] =
                "{$city}, {$country}";
        }

        $searchTerms =
            array_values(
                array_unique(
                    $searchTerms
                )
            );

        /*
        |--------------------------------------------------------------------------
        | Resolve location
        |--------------------------------------------------------------------------
        */

        $location = null;
        $usedSearchTerm = null;

        foreach (
            $searchTerms
            as $searchTerm
        ) {
            try {
                $response =
                    Http::acceptJson()
                        ->timeout(10)
                        ->retry(
                            2,
                            300
                        )
                        ->get(
                            'https://geocoding-api.open-meteo.com/v1/search',
                            [
                                'name' =>
                                    $searchTerm,

                                'count' =>
                                    10,

                                'language' =>
                                    'en',

                                'format' =>
                                    'json',
                            ]
                        );
            } catch (\Throwable $exception) {
                continue;
            }

            if (
                !$response
                    ->successful()
            ) {
                continue;
            }

            $results =
                $response->json(
                    'results',
                    []
                );

            if (
                !is_array($results) ||
                count($results) === 0
            ) {
                continue;
            }

            /*
             * Prefer country match.
             */

            if ($country !== '') {
                foreach (
                    $results
                    as $result
                ) {
                    $resultCountry =
                        trim(
                            (string)
                            (
                                $result['country']
                                ?? ''
                            )
                        );

                    if (
                        $resultCountry !== '' &&
                        strcasecmp(
                            $resultCountry,
                            $country
                        ) === 0
                    ) {
                        $location =
                            $result;

                        $usedSearchTerm =
                            $searchTerm;

                        break 2;
                    }
                }
            }

            /*
             * Fallback to first result.
             */

            $location =
                $results[0];

            $usedSearchTerm =
                $searchTerm;

            break;
        }

        /*
        |--------------------------------------------------------------------------
        | Location not found
        |--------------------------------------------------------------------------
        */

        if (
            !$location ||
            !isset(
                $location['latitude'],
                $location['longitude']
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant location could not be found. Please enter the actual city/town or a valid postal code in Restaurant Profile.',
            ], 422);
        }

        $latitude =
            (float)
            $location['latitude'];

        $longitude =
            (float)
            $location['longitude'];

        /*
        |--------------------------------------------------------------------------
        | Timezone
        |--------------------------------------------------------------------------
        */

        $timezone =
            trim(
                (string)
                $restaurant->timezone
            );

        if ($timezone === '') {
            $timezone =
                $location['timezone']
                ?? 'auto';
        }

        /*
        |--------------------------------------------------------------------------
        | Weather API
        |--------------------------------------------------------------------------
        */

        try {
            $weatherResponse =
                Http::acceptJson()
                    ->timeout(12)
                    ->retry(
                        2,
                        300
                    )
                    ->get(
                        'https://api.open-meteo.com/v1/forecast',
                        [
                            'latitude' =>
                                $latitude,

                            'longitude' =>
                                $longitude,

                            'timezone' =>
                                $timezone,

                            'forecast_days' =>
                                7,

                            'current' =>
                                implode(
                                    ',',
                                    [
                                        'temperature_2m',
                                        'apparent_temperature',
                                        'relative_humidity_2m',
                                        'weather_code',
                                        'wind_speed_10m',
                                        'wind_direction_10m',
                                    ]
                                ),

                            'daily' =>
                                implode(
                                    ',',
                                    [
                                        'weather_code',
                                        'temperature_2m_max',
                                        'temperature_2m_min',
                                        'precipitation_sum',
                                        'precipitation_probability_max',
                                    ]
                                ),
                        ]
                    );
        } catch (\Throwable $exception) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Unable to connect to the weather service.',
            ], 503);
        }

        if (
            !$weatherResponse
                ->successful()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Weather service returned an error.',
            ], 503);
        }

        $weather =
            $weatherResponse->json();

        $current =
            $weather['current']
            ?? [];

        $daily =
            $weather['daily']
            ?? [];

        /*
        |--------------------------------------------------------------------------
        | Forecast normalization
        |--------------------------------------------------------------------------
        */

        $forecast = [];

        $dates =
            $daily['time']
            ?? [];

        foreach (
            $dates
            as $index => $date
        ) {
            $weatherCode =
                (int)
                (
                    $daily['weather_code'][$index]
                    ?? 0
                );

            $forecast[] = [
                'date' =>
                    $date,

                'weather_code' =>
                    $weatherCode,

                'condition' =>
                    $this->weatherCondition(
                        $weatherCode
                    ),

                'icon' =>
                    $this->weatherIcon(
                        $weatherCode
                    ),

                'temperature_max' =>
                    isset(
                        $daily['temperature_2m_max'][$index]
                    )
                        ? round(
                            (float)
                            $daily['temperature_2m_max'][$index],
                            1
                        )
                        : null,

                'temperature_min' =>
                    isset(
                        $daily['temperature_2m_min'][$index]
                    )
                        ? round(
                            (float)
                            $daily['temperature_2m_min'][$index],
                            1
                        )
                        : null,

                'precipitation' =>
                    isset(
                        $daily['precipitation_sum'][$index]
                    )
                        ? round(
                            (float)
                            $daily['precipitation_sum'][$index],
                            2
                        )
                        : 0,

                'precipitation_probability' =>
                    isset(
                        $daily['precipitation_probability_max'][$index]
                    )
                        ? (int)
                            $daily['precipitation_probability_max'][$index]
                        : null,
            ];
        }

        $currentCode =
            (int)
            (
                $current['weather_code']
                ?? 0
            );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'restaurant' => [
                'id' =>
                    $restaurant->id,

                'name' =>
                    $restaurant->name,

                'city' =>
                    $city,

                'country' =>
                    $country,

                'postal_code' =>
                    $postalCode,

                'timezone' =>
                    $timezone,
            ],

            'location' => [
                'name' =>
                    $location['name']
                    ?? $city,

                'admin1' =>
                    $location['admin1']
                    ?? null,

                'admin2' =>
                    $location['admin2']
                    ?? null,

                'country' =>
                    $location['country']
                    ?? $country,

                'country_code' =>
                    $location['country_code']
                    ?? null,

                'latitude' =>
                    $latitude,

                'longitude' =>
                    $longitude,

                'timezone' =>
                    $location['timezone']
                    ?? $timezone,

                'search_term' =>
                    $usedSearchTerm,
            ],

            'current' => [
                'temperature' =>
                    isset(
                        $current['temperature_2m']
                    )
                        ? round(
                            (float)
                            $current['temperature_2m'],
                            1
                        )
                        : null,

                'feels_like' =>
                    isset(
                        $current['apparent_temperature']
                    )
                        ? round(
                            (float)
                            $current['apparent_temperature'],
                            1
                        )
                        : null,

                'humidity' =>
                    isset(
                        $current['relative_humidity_2m']
                    )
                        ? (int)
                            $current['relative_humidity_2m']
                        : null,

                'wind_speed' =>
                    isset(
                        $current['wind_speed_10m']
                    )
                        ? round(
                            (float)
                            $current['wind_speed_10m'],
                            1
                        )
                        : null,

                'wind_direction' =>
                    isset(
                        $current['wind_direction_10m']
                    )
                        ? (int)
                            round(
                                (float)
                                $current['wind_direction_10m']
                            )
                        : null,

                'weather_code' =>
                    $currentCode,

                'condition' =>
                    $this->weatherCondition(
                        $currentCode
                    ),

                'icon' =>
                    $this->weatherIcon(
                        $currentCode
                    ),

                'time' =>
                    $current['time']
                    ?? null,
            ],

            'forecast' =>
                $forecast,

            'units' => [
                'temperature' =>
                    '°C',

                'wind_speed' =>
                    'km/h',

                'precipitation' =>
                    'mm',
            ],
        ]);
    }

    private function weatherCondition(
        int $code
    ): string {
        return match (true) {
            $code === 0 =>
                'Clear sky',

            in_array(
                $code,
                [1, 2],
                true
            ) =>
                'Partly cloudy',

            $code === 3 =>
                'Overcast',

            in_array(
                $code,
                [45, 48],
                true
            ) =>
                'Fog',

            in_array(
                $code,
                [51, 53, 55, 56, 57],
                true
            ) =>
                'Drizzle',

            in_array(
                $code,
                [61, 63, 65, 66, 67],
                true
            ) =>
                'Rain',

            in_array(
                $code,
                [71, 73, 75, 77],
                true
            ) =>
                'Snow',

            in_array(
                $code,
                [80, 81, 82],
                true
            ) =>
                'Rain showers',

            in_array(
                $code,
                [85, 86],
                true
            ) =>
                'Snow showers',

            in_array(
                $code,
                [95, 96, 99],
                true
            ) =>
                'Thunderstorm',

            default =>
                'Unknown',
        };
    }

    private function weatherIcon(
        int $code
    ): string {
        return match (true) {
            $code === 0 =>
                'sun',

            in_array(
                $code,
                [1, 2],
                true
            ) =>
                'cloud-sun',

            $code === 3 =>
                'cloud',

            in_array(
                $code,
                [45, 48],
                true
            ) =>
                'smog',

            in_array(
                $code,
                [
                    51,
                    53,
                    55,
                    56,
                    57,
                    61,
                    63,
                    65,
                    66,
                    67,
                    80,
                    81,
                    82,
                ],
                true
            ) =>
                'cloud-rain',

            in_array(
                $code,
                [
                    71,
                    73,
                    75,
                    77,
                    85,
                    86,
                ],
                true
            ) =>
                'snowflake',

            in_array(
                $code,
                [95, 96, 99],
                true
            ) =>
                'bolt',

            default =>
                'cloud',
        };
    }
}