<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use App\Models\PosConnection;
use App\Services\POS\PosManager;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;
use App\Models\PosLocation;
use Illuminate\Support\Facades\DB;

class PosConnectionController extends Controller
{
    /**
     * Test POS credentials without saving connection.
     */
    public function testConnection(
        Request $request,
        PosManager $posManager
    ) {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'provider' => [
                'required',
                'string',
                Rule::in([
                    'Square POS',
                    'Toast POS',
                    'Clover POS',
                    'Lightspeed',
                    'Restolution',
                    'Custom API',
                ]),
            ],

            'label' => [
                'required',
                'string',
                'max:255',
            ],

            'api_key' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'access_token' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'base_url' => [
                'required',
                'url',
                'max:500',
            ],
        ]);

        try {
            /*
            |--------------------------------------------------------------------------
            | Temporary connection
            |--------------------------------------------------------------------------
            |
            | Nothing is written to database during Test Connection.
            |
            */

            $connection = new PosConnection();

            $connection->restaurant_id =
                $user->restaurant_id;

            $connection->provider =
                $validated['provider'];

            $connection->label =
                $validated['label'];

            $connection->api_key =
                $validated['api_key'] ?? null;

            $connection->access_token =
                $validated['access_token'] ?? null;

            $connection->base_url =
                $validated['base_url'];

            /*
            |--------------------------------------------------------------------------
            | Resolve provider
            |--------------------------------------------------------------------------
            */

            $provider = $posManager->driver(
                $validated['provider']
            );

            /*
            |--------------------------------------------------------------------------
            | Test connection
            |--------------------------------------------------------------------------
            */

            $result = $provider->testConnection(
                $connection
            );

            if (!($result['success'] ?? false)) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        $result['message'] ??
                        'POS connection test failed.',
                    'error' =>
                        $result['error'] ?? null,
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Fetch restaurant / merchant details
            |--------------------------------------------------------------------------
            */

            $merchant = $provider->getMerchant(
                $connection
            );

            /*
            |--------------------------------------------------------------------------
            | Fetch POS locations
            |--------------------------------------------------------------------------
            */

            $locations = $provider->getLocations(
                $connection
            );

            return response()->json([
                'success' => true,

                'message' =>
                    'POS connection test successful.',

                'merchant' => $merchant,

                'locations' => $locations,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' =>
                    'Unable to test POS connection.',
                'error' => $exception->getMessage(),
            ], 422);
        }
    }

    /**
 * Save and connect a POS system.
 */
public function store(
    Request $request,
    PosManager $posManager
) {
    $user = $request->user();

    if (!$user || !$user->restaurant_id) {
        return response()->json([
            'success' => false,
            'message' => 'Restaurant not found.',
        ], 404);
    }

    $validated = $request->validate([
        'provider' => [
            'required',
            'string',
            Rule::in([
                'Square POS',
                'Toast POS',
                'Clover POS',
                'Lightspeed',
                'Restolution',
                'Custom API',
            ]),
        ],

        'label' => [
            'required',
            'string',
            'max:255',
        ],

        'api_key' => [
            'nullable',
            'string',
            'max:5000',
        ],

        'access_token' => [
            'nullable',
            'string',
            'max:5000',
        ],

        'base_url' => [
            'required',
            'url',
            'max:500',
        ],
    ]);

    try {
        /*
        |--------------------------------------------------------------------------
        | Temporary connection for validation / remote API calls
        |--------------------------------------------------------------------------
        */

        $temporaryConnection = new PosConnection();

        $temporaryConnection->restaurant_id =
            $user->restaurant_id;

        $temporaryConnection->provider =
            $validated['provider'];

        $temporaryConnection->label =
            $validated['label'];

        $temporaryConnection->api_key =
            $validated['api_key'] ?? null;

        $temporaryConnection->access_token =
            $validated['access_token'] ?? null;

        $temporaryConnection->base_url =
            $validated['base_url'];

        /*
        |--------------------------------------------------------------------------
        | Resolve Provider
        |--------------------------------------------------------------------------
        */

        $provider = $posManager->driver(
            $validated['provider']
        );

        /*
        |--------------------------------------------------------------------------
        | Verify Connection
        |--------------------------------------------------------------------------
        */

        $testResult = $provider->testConnection(
            $temporaryConnection
        );

        if (!($testResult['success'] ?? false)) {
            return response()->json([
                'success' => false,

                'message' =>
                    $testResult['message'] ??
                    'POS connection test failed.',

                'error' =>
                    $testResult['error'] ?? null,
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Fetch POS Business Details
        |--------------------------------------------------------------------------
        */

        $merchant = $provider->getMerchant(
            $temporaryConnection
        );

        $locations = $provider->getLocations(
            $temporaryConnection
        );

        /*
        |--------------------------------------------------------------------------
        | Save Everything Atomically
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(
            function () use (
                $user,
                $validated,
                $merchant,
                $locations
            ) {
                /*
                |--------------------------------------------------------------------------
                | POS Connection
                |--------------------------------------------------------------------------
                */

                $connection = PosConnection::create([
                    'restaurant_id' =>
                        $user->restaurant_id,

                    'provider' =>
                        $validated['provider'],

                    'label' =>
                        $validated['label'],

                    'api_key' =>
                        $validated['api_key'] ?? null,

                    'access_token' =>
                        $validated['access_token'] ?? null,

                    'base_url' =>
                        $validated['base_url'],

                    'external_merchant_id' =>
                        $merchant[
                            'external_merchant_id'
                        ] ?? null,

                    'status' =>
                        'connected',

                    'last_error' =>
                        null,

                    'last_connected_at' =>
                        now(),

                    'is_active' =>
                        true,
                ]);

                /*
                |--------------------------------------------------------------------------
                | POS Locations
                |--------------------------------------------------------------------------
                */

                foreach ($locations as $location) {
                    PosLocation::create([
                        'pos_connection_id' =>
                            $connection->id,

                        'restaurant_id' =>
                            $user->restaurant_id,

                        'external_location_id' =>
                            $location[
                                'external_location_id'
                            ] ?? null,

                        'external_business_id' =>
                            $location[
                                'external_business_id'
                            ] ?? null,

                        'name' =>
                            $location['name'] ?? null,

                        'legal_name' =>
                            $location[
                                'legal_name'
                            ] ?? null,

                        'phone' =>
                            $location['phone'] ?? null,

                        'email' =>
                            $location['email'] ?? null,

                        'address_line_1' =>
                            $location[
                                'address_line_1'
                            ] ?? null,

                        'address_line_2' =>
                            $location[
                                'address_line_2'
                            ] ?? null,

                        'city' =>
                            $location['city'] ?? null,

                        'postal_code' =>
                            $location[
                                'postal_code'
                            ] ?? null,

                        'country' =>
                            $location[
                                'country'
                            ] ?? null,

                        'currency' =>
                            $location[
                                'currency'
                            ] ?? null,

                        'timezone' =>
                            $location[
                                'timezone'
                            ] ?? null,

                        'raw_data' =>
                            $location[
                                'raw_data'
                            ] ?? null,

                        'last_fetched_at' =>
                            now(),

                        'is_active' =>
                            true,
                    ]);
                }

                return $connection;
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Safe Response
        |--------------------------------------------------------------------------
        |
        | api_key/access_token intentionally response me nahi bhej rahe.
        |
        */

        return response()->json([
            'success' => true,

            'message' =>
                'POS connection added successfully.',

            'connection' => [
                'id' => $result->id,

                'provider' =>
                    $result->provider,

                'label' =>
                    $result->label,

                'status' =>
                    $result->status,

                'external_merchant_id' =>
                    $result->external_merchant_id,

                'last_connected_at' =>
                    $result->last_connected_at,
            ],

            'merchant' => $merchant,

            'locations' => $locations,
        ], 201);

    } catch (Throwable $exception) {
        report($exception);

        return response()->json([
            'success' => false,

            'message' =>
                'Unable to add POS connection.',

            'error' =>
                $exception->getMessage(),
        ], 422);
    }
}
}
