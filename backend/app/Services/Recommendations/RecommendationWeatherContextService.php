<?php

namespace App\Services\Recommendations;

use App\Models\Restaurant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class RecommendationWeatherContextService
{
    /**
     * Build compact weather context for AI recommendations.
     *
     * Weather failure must never prevent recommendation generation.
     */
    public function build(
        Restaurant $restaurant
    ): ?array {
        return Cache::remember(
            "recommendation_weather_context:{$restaurant->id}",
            now()->addMinutes(30),
            fn () =>
                $this->fetchWeatherContext(
                    $restaurant
                )
        );
    }

    /**
     * Resolve restaurant location and fetch weather.
     */
    private function fetchWeatherContext(
        Restaurant $restaurant
    ): ?array {
        try {
            $location =
                $this->resolveLocation(
                    $restaurant
                );

            if (!$location) {
                return null;
            }

            $timezone =
                trim(
                    (string)
                        $restaurant
                            ->timezone
                );

            if ($timezone === '') {
                $timezone =
                    (string) (
                        $location[
                            'timezone'
                        ]
                        ?? 'auto'
                    );
            }

            $response =
                Http::acceptJson()
                    ->connectTimeout(5)
                    ->timeout(12)
                    ->retry(
                        2,
                        300,
                        throw: false
                    )
                    ->get(
                        'https://api.open-meteo.com/v1/forecast',
                        [
                            'latitude' =>
                                (float)
                                    $location[
                                        'latitude'
                                    ],

                            'longitude' =>
                                (float)
                                    $location[
                                        'longitude'
                                    ],

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

            if (!$response->successful()) {
                return null;
            }

            $weather =
                $response->json();

            if (!is_array($weather)) {
                return null;
            }

            $current =
                $weather['current']
                ?? [];

            $daily =
                $weather['daily']
                ?? [];

            return [
                'source' =>
                    'Open-Meteo',

                'retrieved_at' =>
                    now()->toIso8601String(),

                'location' => [
                    'city' =>
                        $location['name']
                        ?? $restaurant->city,

                    'country' =>
                        $location['country']
                        ?? $restaurant->country,

                    'timezone' =>
                        $location['timezone']
                        ?? $timezone,
                ],

                'current' =>
                    $this->currentWeather(
                        is_array($current)
                            ? $current
                            : []
                    ),

                'forecast' =>
                    $this->forecast(
                        is_array($daily)
                            ? $daily
                            : []
                    ),

                'units' => [
                    'temperature' =>
                        'celsius',

                    'precipitation' =>
                        'millimetres',

                    'probability' =>
                        'percent',
                ],
            ];
        } catch (Throwable) {
            /*
             * Recommendations should continue using
             * restaurant analytics and holiday data
             * when weather is temporarily unavailable.
             */

            return null;
        }
    }

    /**
     * Resolve restaurant city/postal code into coordinates.
     */
    private function resolveLocation(
        Restaurant $restaurant
    ): ?array {
        $city =
            trim(
                (string)
                    $restaurant->city
            );

        $country =
            trim(
                (string)
                    $restaurant->country
            );

        $postalCode =
            trim(
                (string)
                    $restaurant
                        ->postal_code
            );

        $searchTerms = [];

        if (
            $city !== '' &&
            $country !== ''
        ) {
            $searchTerms[] =
                "{$city}, {$country}";
        }

        if ($city !== '') {
            $searchTerms[] =
                $city;
        }

        if ($postalCode !== '') {
            $searchTerms[] =
                $postalCode;
        }

        $searchTerms =
            array_values(
                array_unique(
                    $searchTerms
                )
            );

        foreach (
            $searchTerms
            as $searchTerm
        ) {
            $response =
                Http::acceptJson()
                    ->connectTimeout(5)
                    ->timeout(10)
                    ->retry(
                        2,
                        300,
                        throw: false
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

            if (!$response->successful()) {
                continue;
            }

            $results =
                $response->json(
                    'results',
                    []
                );

            if (
                !is_array($results) ||
                $results === []
            ) {
                continue;
            }

            if ($country !== '') {
                foreach (
                    $results
                    as $result
                ) {
                    if (
                        !is_array($result)
                    ) {
                        continue;
                    }

                    $resultCountry =
                        trim(
                            (string) (
                                $result[
                                    'country'
                                ]
                                ?? ''
                            )
                        );

                    if (
                        $resultCountry !== '' &&
                        strcasecmp(
                            $resultCountry,
                            $country
                        ) === 0 &&
                        isset(
                            $result[
                                'latitude'
                            ],
                            $result[
                                'longitude'
                            ]
                        )
                    ) {
                        return $result;
                    }
                }
            }

            $firstResult =
                $results[0];

            if (
                is_array(
                    $firstResult
                ) &&
                isset(
                    $firstResult[
                        'latitude'
                    ],
                    $firstResult[
                        'longitude'
                    ]
                )
            ) {
                return $firstResult;
            }
        }

        return null;
    }

    /**
     * Normalize current weather.
     */
    private function currentWeather(
        array $current
    ): array {
        $weatherCode =
            (int) (
                $current[
                    'weather_code'
                ]
                ?? 0
            );

        return [
            'observed_at' =>
                $current['time']
                ?? null,

            'condition' =>
                $this->condition(
                    $weatherCode
                ),

            'temperature' =>
                $this->nullableFloat(
                    $current[
                        'temperature_2m'
                    ]
                    ?? null
                ),

            'feels_like' =>
                $this->nullableFloat(
                    $current[
                        'apparent_temperature'
                    ]
                    ?? null
                ),

            'humidity_percent' =>
                isset(
                    $current[
                        'relative_humidity_2m'
                    ]
                )
                    ? (int)
                        $current[
                            'relative_humidity_2m'
                        ]
                    : null,
        ];
    }

    /**
     * Normalize seven-day forecast.
     */
    private function forecast(
        array $daily
    ): array {
        $dates =
            $daily['time']
            ?? [];

        if (!is_array($dates)) {
            return [];
        }

        $forecast = [];

        foreach (
            $dates
            as $index => $date
        ) {
            $weatherCode =
                (int) (
                    $daily[
                        'weather_code'
                    ][$index]
                    ?? 0
                );

            $forecast[] = [
                'date' =>
                    $date,

                'condition' =>
                    $this->condition(
                        $weatherCode
                    ),

                'temperature_max' =>
                    $this->nullableFloat(
                        $daily[
                            'temperature_2m_max'
                        ][$index]
                        ?? null
                    ),

                'temperature_min' =>
                    $this->nullableFloat(
                        $daily[
                            'temperature_2m_min'
                        ][$index]
                        ?? null
                    ),

                'precipitation' =>
                    $this->nullableFloat(
                        $daily[
                            'precipitation_sum'
                        ][$index]
                        ?? null
                    ),

                'precipitation_probability' =>
                    isset(
                        $daily[
                            'precipitation_probability_max'
                        ][$index]
                    )
                        ? (int)
                            $daily[
                                'precipitation_probability_max'
                            ][$index]
                        : null,
            ];
        }

        return $forecast;
    }

    /**
     * Convert WMO weather code into useful AI context.
     */
    private function condition(
        int $code
    ): string {
        return match (true) {
            $code === 0 =>
                'Clear sky',

            in_array(
                $code,
                [1, 2, 3],
                true
            ) =>
                'Partly cloudy or overcast',

            in_array(
                $code,
                [45, 48],
                true
            ) =>
                'Foggy',

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

    private function nullableFloat(
        mixed $value
    ): ?float {
        if (
            $value === null ||
            !is_numeric($value)
        ) {
            return null;
        }

        return round(
            (float) $value,
            1
        );
    }
}