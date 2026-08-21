<?php

namespace App\Services\POS\Custom;

use App\Models\PosConnection;
use App\Services\POS\PosProviderInterface;
use App\Services\POS\PosUrlValidator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class CustomApiProvider implements PosProviderInterface
{
    /**
     * Test credentials and basic API connectivity.
     */
    public function testConnection(
        PosConnection $connection
    ): array {
        try {
            $response = $this
                ->request($connection)
                ->get(
                    $this->url(
                        $connection,
                        '/restaurant'
                    )
                );

            if (!$response->successful()) {
                throw new RuntimeException(
                    $this->errorMessage(
                        $response->status(),
                        $response->json()
                    )
                );
            }

            return [
                'success' => true,

                'message' =>
                    'POS connection successful.',

                'status_code' =>
                    $response->status(),
            ];
        } catch (ConnectionException $exception) {
            return [
                'success' => false,

                'message' =>
                    'Unable to reach the POS API.',

                'error' =>
                    $exception->getMessage(),
            ];
        } catch (Throwable $exception) {
            return [
                'success' => false,

                'message' =>
                    $exception->getMessage(),
            ];
        }
    }

    /**
     * Fetch merchant / restaurant information.
     */
    public function getMerchant(
        PosConnection $connection
    ): array {
        $response = $this
            ->request($connection)
            ->get(
                $this->url(
                    $connection,
                    '/restaurant'
                )
            );

        if (!$response->successful()) {
            throw new RuntimeException(
                $this->errorMessage(
                    $response->status(),
                    $response->json()
                )
            );
        }

        $data = $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'POS merchant response is invalid.'
            );
        }

        return [
            'external_merchant_id' =>
                data_get(
                    $data,
                    'id'
                )
                ??
                data_get(
                    $data,
                    'merchant_id'
                )
                ??
                data_get(
                    $data,
                    'business.id'
                ),

            'name' =>
                data_get(
                    $data,
                    'name'
                )
                ??
                data_get(
                    $data,
                    'restaurant_name'
                )
                ??
                data_get(
                    $data,
                    'business.name'
                ),

            'legal_name' =>
                data_get(
                    $data,
                    'legal_name'
                )
                ??
                data_get(
                    $data,
                    'business.legal_name'
                ),

            'phone' =>
                data_get(
                    $data,
                    'phone'
                )
                ??
                data_get(
                    $data,
                    'contact.phone'
                ),

            'email' =>
                data_get(
                    $data,
                    'email'
                )
                ??
                data_get(
                    $data,
                    'contact.email'
                ),

            'address_line_1' =>
                data_get(
                    $data,
                    'address_line_1'
                )
                ??
                data_get(
                    $data,
                    'address.address_line_1'
                )
                ??
                data_get(
                    $data,
                    'address.line1'
                ),

            'address_line_2' =>
                data_get(
                    $data,
                    'address_line_2'
                )
                ??
                data_get(
                    $data,
                    'address.address_line_2'
                )
                ??
                data_get(
                    $data,
                    'address.line2'
                ),

            'city' =>
                data_get(
                    $data,
                    'city'
                )
                ??
                data_get(
                    $data,
                    'address.city'
                ),

            'postal_code' =>
                data_get(
                    $data,
                    'postal_code'
                )
                ??
                data_get(
                    $data,
                    'address.postal_code'
                )
                ??
                data_get(
                    $data,
                    'address.zip'
                ),

            'country' =>
                data_get(
                    $data,
                    'country'
                )
                ??
                data_get(
                    $data,
                    'address.country'
                ),

            'currency' =>
                data_get(
                    $data,
                    'currency'
                ),

            'timezone' =>
                data_get(
                    $data,
                    'timezone'
                ),

            'raw_data' =>
                $data,
        ];
    }

    /**
     * Fetch locations / branches.
     */
    public function getLocations(
        PosConnection $connection
    ): array {
        $response = $this
            ->request($connection)
            ->get(
                $this->url(
                    $connection,
                    '/locations'
                )
            );

        if ($response->successful()) {
            $data = $response->json();

            $items =
                data_get(
                    $data,
                    'locations'
                )
                ??
                data_get(
                    $data,
                    'data'
                )
                ??
                $data;

            if (!is_array($items)) {
                return [];
            }

            return collect($items)
                ->filter(
                    fn ($item) =>
                        is_array($item)
                )
                ->map(
                    fn ($item) =>
                        $this->normalizeLocation(
                            $item
                        )
                )
                ->values()
                ->all();
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback
        |--------------------------------------------------------------------------
        |
        | Some POS APIs do not expose a separate locations endpoint.
        | In that case, merchant itself becomes one location.
        |
        */

        $merchant =
            $this->getMerchant(
                $connection
            );

        return [
            [
                'external_location_id' =>
                    $merchant[
                        'external_merchant_id'
                    ] ?? null,

                'external_business_id' =>
                    $merchant[
                        'external_merchant_id'
                    ] ?? null,

                'name' =>
                    $merchant[
                        'name'
                    ] ?? null,

                'legal_name' =>
                    $merchant[
                        'legal_name'
                    ] ?? null,

                'phone' =>
                    $merchant[
                        'phone'
                    ] ?? null,

                'email' =>
                    $merchant[
                        'email'
                    ] ?? null,

                'address_line_1' =>
                    $merchant[
                        'address_line_1'
                    ] ?? null,

                'address_line_2' =>
                    $merchant[
                        'address_line_2'
                    ] ?? null,

                'city' =>
                    $merchant[
                        'city'
                    ] ?? null,

                'postal_code' =>
                    $merchant[
                        'postal_code'
                    ] ?? null,

                'country' =>
                    $merchant[
                        'country'
                    ] ?? null,

                'currency' =>
                    $merchant[
                        'currency'
                    ] ?? null,

                'timezone' =>
                    $merchant[
                        'timezone'
                    ] ?? null,

                'raw_data' =>
                    $merchant[
                        'raw_data'
                    ] ?? [],
            ],
        ];
    }

    /**
     * Fetch POS menu / catalog.
     */
    public function getMenu(
        PosConnection $connection
    ): array {
        $response = $this
            ->request($connection)
            ->get(
                $this->url(
                    $connection,
                    '/menu'
                )
            );

        if (!$response->successful()) {
            throw new RuntimeException(
                'Unable to fetch Custom API menu. HTTP ' .
                $response->status()
            );
        }

        $data =
            $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'Custom API menu response is invalid.'
            );
        }

        $categories =
            data_get(
                $data,
                'categories',
                []
            );

        if (!is_array($categories)) {
            throw new RuntimeException(
                'Custom API menu categories are invalid.'
            );
        }

        return array_values(
            array_filter(
                $categories,
                fn ($category) =>
                    is_array($category)
            )
        );
    }

    /**
     * Fetch POS orders.
     */
    public function getOrders(
        PosConnection $connection,
        \Carbon\CarbonInterface $start,
        \Carbon\CarbonInterface $end
    ): array {
        $response = $this
            ->request($connection)
            ->get(
                $this->url(
                    $connection,
                    '/orders'
                ),
                [
                    'start' =>
                        $start
                            ->toIso8601String(),

                    'end' =>
                        $end
                            ->toIso8601String(),
                ]
            );

        if (!$response->successful()) {
            throw new RuntimeException(
                'Unable to fetch Custom API orders. HTTP ' .
                $response->status()
            );
        }

        $data =
            $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'Custom API orders response is invalid.'
            );
        }

        $orders =
            data_get(
                $data,
                'orders',
                []
            );

        if (!is_array($orders)) {
            throw new RuntimeException(
                'Custom API orders response is invalid.'
            );
        }

        return $orders;
    }

    /**
     * Build authenticated HTTP request.
     */
    private function request(
        PosConnection $connection
    ) {
        $request =
            Http::acceptJson()
                ->timeout(30)
                ->connectTimeout(10);

        /*
        |--------------------------------------------------------------------------
        | Access Token
        |--------------------------------------------------------------------------
        */

        if ($connection->access_token) {
            $request =
                $request->withToken(
                    $connection
                        ->access_token
                );
        }

        /*
        |--------------------------------------------------------------------------
        | API Key
        |--------------------------------------------------------------------------
        */

        if ($connection->api_key) {
            $request =
                $request->withHeaders([
                    'X-API-Key' =>
                        $connection
                            ->api_key,
                ]);
        }

        return $request;
    }

    /**
     * Build and validate endpoint URL.
     */
    private function url(
        PosConnection $connection,
        string $path
    ): string {
        $baseUrl =
            PosUrlValidator::validate(
                (string)
                    $connection
                        ->base_url
            );

        return rtrim(
            $baseUrl,
            '/'
        ) .
            '/' .
            ltrim(
                $path,
                '/'
            );
    }

    /**
     * Normalize one POS location.
     */
    private function normalizeLocation(
        array $data
    ): array {
        return [
            'external_location_id' =>
                data_get(
                    $data,
                    'id'
                )
                ??
                data_get(
                    $data,
                    'location_id'
                ),

            'external_business_id' =>
                data_get(
                    $data,
                    'business_id'
                )
                ??
                data_get(
                    $data,
                    'merchant_id'
                ),

            'name' =>
                data_get(
                    $data,
                    'name'
                ),

            'legal_name' =>
                data_get(
                    $data,
                    'legal_name'
                ),

            'phone' =>
                data_get(
                    $data,
                    'phone'
                )
                ??
                data_get(
                    $data,
                    'contact.phone'
                ),

            'email' =>
                data_get(
                    $data,
                    'email'
                )
                ??
                data_get(
                    $data,
                    'contact.email'
                ),

            'address_line_1' =>
                data_get(
                    $data,
                    'address_line_1'
                )
                ??
                data_get(
                    $data,
                    'address.line1'
                ),

            'address_line_2' =>
                data_get(
                    $data,
                    'address_line_2'
                )
                ??
                data_get(
                    $data,
                    'address.line2'
                ),

            'city' =>
                data_get(
                    $data,
                    'city'
                )
                ??
                data_get(
                    $data,
                    'address.city'
                ),

            'postal_code' =>
                data_get(
                    $data,
                    'postal_code'
                )
                ??
                data_get(
                    $data,
                    'address.postal_code'
                )
                ??
                data_get(
                    $data,
                    'address.zip'
                ),

            'country' =>
                data_get(
                    $data,
                    'country'
                )
                ??
                data_get(
                    $data,
                    'address.country'
                ),

            'currency' =>
                data_get(
                    $data,
                    'currency'
                ),

            'timezone' =>
                data_get(
                    $data,
                    'timezone'
                ),

            'raw_data' =>
                $data,
        ];
    }

    /**
     * Human-readable API error.
     */
    private function errorMessage(
        int $status,
        mixed $data
    ): string {
        $message =
            is_array($data)
                ? (
                    data_get(
                        $data,
                        'message'
                    )
                    ??
                    data_get(
                        $data,
                        'error'
                    )
                    ??
                    data_get(
                        $data,
                        'errors.0.message'
                    )
                )
                : null;

        return $message
            ? "POS API error ({$status}): {$message}"
            : "POS API returned HTTP {$status}.";
    }
}