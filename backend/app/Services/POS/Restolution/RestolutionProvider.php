<?php

namespace App\Services\POS\Restolution;

use App\Models\PosConnection;
use App\Services\POS\PosProviderInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;
use App\Services\POS\PosUrlValidator;

class RestolutionProvider implements PosProviderInterface
{
    /**
     * Test Restolution API connectivity.
     *
     * Exact endpoint/header mapping must be confirmed
     * from the restaurant's Restolution API documentation.
     */
    public function testConnection(
        PosConnection $connection
    ): array {
        try {
            $this->validateConnection(
                $connection
            );

            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            |
            | We intentionally do NOT guess a Restolution production endpoint here.
            |
            | Once official Restolution API documentation / credentials are
            | available, this method will call the documented account or
            | restaurant endpoint.
            |
            */

            return [
                'success' => false,

                'message' =>
                    'Restolution adapter is configured, but the official API endpoint and authentication contract still need to be supplied.',
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
     * Fetch and normalize Restolution restaurant details.
     */
    public function getMerchant(
        PosConnection $connection
    ): array {
        $this->validateConnection(
            $connection
        );

        throw new RuntimeException(
            'Restolution merchant endpoint is not configured yet.'
        );
    }

    /**
     * Fetch and normalize Restolution locations.
     */
    public function getLocations(
        PosConnection $connection
    ): array {
        $this->validateConnection(
            $connection
        );

        throw new RuntimeException(
            'Restolution locations endpoint is not configured yet.'
        );
    }

    /**
     * Build base authenticated request.
     *
     * This will be updated once Restolution confirms
     * its exact authentication header/token format.
     */
    private function request(
        PosConnection $connection
    ) {
        $request = Http::acceptJson()
            ->timeout(20)
            ->connectTimeout(10);

        /*
        |--------------------------------------------------------------------------
        | Temporary generic credential support
        |--------------------------------------------------------------------------
        |
        | These are NOT claimed to be Restolution's official authentication
        | headers. They are only retained so the adapter structure is ready.
        |
        */

        if ($connection->access_token) {
            $request =
                $request->withToken(
                    $connection->access_token
                );
        }

        if ($connection->api_key) {
            $request =
                $request->withHeaders([
                    'X-API-Key' =>
                        $connection->api_key,
                ]);
        }

        return $request;
    }

    /**
     * Validate required connection configuration.
     */
    private function validateConnection(
        PosConnection $connection
    ): void {
        if (!$connection->base_url) {
            throw new RuntimeException(
                'Restolution API Base URL is required.'
            );
        }

        if (
            !$connection->api_key &&
            !$connection->access_token
        ) {
            throw new RuntimeException(
                'Restolution API credentials are required.'
            );
        }

        $this->baseUrl(
            $connection
        );
    }

    /**
     * Normalize base URL.
     */
    private function baseUrl(
    PosConnection $connection
): string {
    return PosUrlValidator::validate(
        (string) $connection->base_url
    );
}

    public function getOrders(
    PosConnection $connection,
    \Carbon\CarbonInterface $start,
    \Carbon\CarbonInterface $end
): array {
    throw new RuntimeException(
        'Restolution orders endpoint is not configured yet.'
    );
}
}
