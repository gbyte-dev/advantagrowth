<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WeatherController extends Controller
{
    public function overview(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $latitude = isset($validated['latitude']) ? (float) $validated['latitude'] : null;
        $longitude = isset($validated['longitude']) ? (float) $validated['longitude'] : null;

        // No coordinates from the browser (permission denied/unsupported) —
        // fall back to an approximate location resolved from the IP address.
        if ($latitude === null || $longitude === null) {
            $ipLocation = $this->locateByIp();

            if (!$ipLocation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not determine your location. Please allow location access and try again.',
                ], 422);
            }

            $latitude = $ipLocation['latitude'];
            $longitude = $ipLocation['longitude'];
        }

        // Round to ~1km precision so nearby requests within the cache
        // window share a cached response instead of re-fetching.
        $cacheKey = sprintf('weather_%.2f_%.2f', $latitude, $longitude);

        $result = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($latitude, $longitude) {
            return $this->fetchWeather($latitude, $longitude);
        });

        if (!$result['success']) {
            Cache::forget($cacheKey);
            return response()->json($result, 503);
        }

        return response()->json($result);
    }

    /**
     * Resolve an approximate latitude/longitude from the server's public IP,
     * used as a fallback when the browser doesn't provide precise coordinates.
     * Cached for a day since a server's IP-based location doesn't change often.
     */
    private function locateByIp(): ?array
    {
        $cached = Cache::get('weather_ip_location');
        if ($cached) {
            return $cached;
        }

        try {
            // No IP passed — the service geolocates whoever is making the request,
            // i.e. this server, which is the right fallback for a single-deployment app.
            $response = Http::withOptions(['verify' => false])
                ->timeout(5)
                ->get('http://ip-api.com/json/');

            if ($response->successful() && $response->json('status') === 'success') {
                $location = [
                    'latitude' => (float) $response->json('lat'),
                    'longitude' => (float) $response->json('lon'),
                ];

                Cache::put('weather_ip_location', $location, now()->addDay());

                return $location;
            }
        } catch (\Throwable $e) {
            // fall through to null below
        }

        return null;
    }

    private function fetchWeather(float $latitude, float $longitude): array
    {
        $locationName = 'Current location';
        $country = null;

        // Reverse-geocoding and the forecast are independent — fire both
        // requests together instead of waiting on one before starting the other.
        $responses = Http::pool(fn (Pool $pool) => [
            $pool->as('geo')->withOptions(['verify' => false])->timeout(8)->get(
                'https://api.bigdatacloud.net/data/reverse-geocode-client',
                [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'localityLanguage' => 'en',
                ]
            ),
            $pool->as('weather')->withOptions(['verify' => false])->timeout(10)->get(
                'https://api.open-meteo.com/v1/forecast',
                [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'timezone' => 'auto',
                    'forecast_days' => 7,
                    'current' => implode(',', [
                        'temperature_2m',
                        'apparent_temperature',
                        'relative_humidity_2m',
                        'weather_code',
                        'wind_speed_10m',
                        'wind_direction_10m',
                    ]),
                    'daily' => implode(',', [
                        'weather_code',
                        'temperature_2m_max',
                        'temperature_2m_min',
                        'precipitation_sum',
                        'precipitation_probability_max',
                    ]),
                ]
            ),
        ]);

        $geoResponse = $responses['geo'] ?? null;
        $weatherResponse = $responses['weather'] ?? null;

        if ($geoResponse && !($geoResponse instanceof \Throwable) && $geoResponse->successful()) {
            $city = $geoResponse->json('city') ?: $geoResponse->json('locality');
            $country = $geoResponse->json('countryName');
            $resolved = collect([$city, $country])->filter()->implode(', ');
            if ($resolved !== '') {
                $locationName = $resolved;
            }
        }

        if (!$weatherResponse || $weatherResponse instanceof \Throwable) {
            return [
                'success' => false,
                'message' => 'Unable to connect to the weather service.',
            ];
        }

        if (!$weatherResponse->successful()) {
            return [
                'success' => false,
                'message' => 'Weather service returned an error.',
            ];
        }

        $weather = $weatherResponse->json();
        $current = $weather['current'] ?? [];
        $daily = $weather['daily'] ?? [];

        $forecast = [];
        $dates = $daily['time'] ?? [];

        foreach ($dates as $index => $date) {
            $weatherCode = (int) ($daily['weather_code'][$index] ?? 0);

            $forecast[] = [
                'date' => $date,
                'weather_code' => $weatherCode,
                'condition' => $this->weatherCondition($weatherCode),
                'icon' => $this->weatherIcon($weatherCode),
                'temperature_max' => isset($daily['temperature_2m_max'][$index])
                    ? round((float) $daily['temperature_2m_max'][$index], 1)
                    : null,
                'temperature_min' => isset($daily['temperature_2m_min'][$index])
                    ? round((float) $daily['temperature_2m_min'][$index], 1)
                    : null,
                'precipitation' => isset($daily['precipitation_sum'][$index])
                    ? round((float) $daily['precipitation_sum'][$index], 2)
                    : 0,
                'precipitation_probability' => isset($daily['precipitation_probability_max'][$index])
                    ? (int) $daily['precipitation_probability_max'][$index]
                    : null,
            ];
        }

        $currentCode = (int) ($current['weather_code'] ?? 0);

        return [
            'success' => true,
            'location' => [
                'name' => $locationName,
                'country' => $country,
                'latitude' => $latitude,
                'longitude' => $longitude,
            ],
            'current' => [
                'temperature' => isset($current['temperature_2m']) ? round((float) $current['temperature_2m'], 1) : null,
                'feels_like' => isset($current['apparent_temperature']) ? round((float) $current['apparent_temperature'], 1) : null,
                'humidity' => isset($current['relative_humidity_2m']) ? (int) $current['relative_humidity_2m'] : null,
                'wind_speed' => isset($current['wind_speed_10m']) ? round((float) $current['wind_speed_10m'], 1) : null,
                'wind_direction' => isset($current['wind_direction_10m']) ? (int) round((float) $current['wind_direction_10m']) : null,
                'weather_code' => $currentCode,
                'condition' => $this->weatherCondition($currentCode),
                'icon' => $this->weatherIcon($currentCode),
                'time' => $current['time'] ?? null,
            ],
            'forecast' => $forecast,
            'units' => [
                'temperature' => '°C',
                'wind_speed' => 'km/h',
                'precipitation' => 'mm',
            ],
        ];
    }

    private function weatherCondition(int $code): string
    {
        return match (true) {
            $code === 0 => 'Clear sky',
            in_array($code, [1, 2], true) => 'Partly cloudy',
            $code === 3 => 'Overcast',
            in_array($code, [45, 48], true) => 'Fog',
            in_array($code, [51, 53, 55, 56, 57], true) => 'Drizzle',
            in_array($code, [61, 63, 65, 66, 67], true) => 'Rain',
            in_array($code, [71, 73, 75, 77], true) => 'Snow',
            in_array($code, [80, 81, 82], true) => 'Rain showers',
            in_array($code, [85, 86], true) => 'Snow showers',
            in_array($code, [95, 96, 99], true) => 'Thunderstorm',
            default => 'Unknown',
        };
    }

    private function weatherIcon(int $code): string
    {
        return match (true) {
            $code === 0 => 'sun',
            in_array($code, [1, 2], true) => 'cloud-sun',
            $code === 3 => 'cloud',
            in_array($code, [45, 48], true) => 'smog',
            in_array($code, [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], true) => 'cloud-rain',
            in_array($code, [71, 73, 75, 77, 85, 86], true) => 'snowflake',
            in_array($code, [95, 96, 99], true) => 'bolt',
            default => 'cloud',
        };
    }
}
