<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use App\Models\PosConnection;
use App\Models\PosLocation;
use App\Models\PosSyncLog;
use App\Services\POS\PosManager;
use App\Services\POS\PosOrderSyncService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use RuntimeException;
use Throwable;

class PosConnectionController extends Controller
{
    /**
     * Get logged-in restaurant POS connections.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $connections = PosConnection::where(
            'restaurant_id',
            $user->restaurant_id
        )
            ->withCount('locations')
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,

            'connections' =>
                $connections
                    ->map(
                        function (
                            PosConnection $connection
                        ) {
                            return [
                                'id' =>
                                    $connection->id,

                                'provider' =>
                                    $connection->provider,

                                'label' =>
                                    $connection->label,

                                'status' =>
                                    $connection->status,

                                'external_merchant_id' =>
                                    $connection
                                        ->external_merchant_id,

                                'last_connected_at' =>
                                    $connection
                                        ->last_connected_at,

                                'last_synced_at' =>
                                    $connection
                                        ->last_synced_at,

                                'locations_count' =>
                                    $connection
                                        ->locations_count,

                                'is_active' =>
                                    $connection
                                        ->is_active,
                            ];
                        }
                    )
                    ->values(),
        ]);
    }

    /**
     * Test POS credentials without saving.
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
                    'Toast POS',
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

            'external_merchant_id' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        try {
            /*
            |--------------------------------------------------------------------------
            | Temporary connection
            |--------------------------------------------------------------------------
            |
            | Nothing is saved during Test Connection.
            |
            */

            $connection =
                new PosConnection();

            $connection->restaurant_id =
                $user->restaurant_id;

            $connection->provider =
                $validated['provider'];

            $connection->label =
                $validated['label'];

            $connection->api_key =
                $validated['api_key']
                ?? null;

            $connection->access_token =
                $validated['access_token']
                ?? null;

            $connection->base_url =
                $validated['base_url'];

            $connection->external_merchant_id =
                $validated[
                    'external_merchant_id'
                ] ?? null;

            /*
            |--------------------------------------------------------------------------
            | Resolve provider
            |--------------------------------------------------------------------------
            */

            $provider =
                $posManager->driver(
                    $validated['provider']
                );

            /*
            |--------------------------------------------------------------------------
            | Test remote connection
            |--------------------------------------------------------------------------
            */

            $result =
                $provider->testConnection(
                    $connection
                );

            if (
                !($result['success'] ?? false)
            ) {
                return response()->json([
                    'success' => false,

                    /*
                     * Detailed provider errors are useful locally,
                     * but should not be exposed in production.
                     */

                    'message' =>
                        $this->publicErrorMessage(
                            'POS connection test failed.',
                            $result['message'] ?? null
                        ),

                    'error' =>
                        config('app.debug')
                            ? ($result['error'] ?? null)
                            : null,
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Fetch merchant
            |--------------------------------------------------------------------------
            */

            $merchant =
                $provider->getMerchant(
                    $connection
                );

            /*
            |--------------------------------------------------------------------------
            | Fetch locations
            |--------------------------------------------------------------------------
            */

            $locations =
                $provider->getLocations(
                    $connection
                );

            /*
            |--------------------------------------------------------------------------
            | Test response
            |--------------------------------------------------------------------------
            */

            return response()->json([
                'success' => true,

                'message' =>
                    $result['message']
                    ??
                    'POS connection test successful.',

                'merchant' =>
                    $merchant,

                'locations' =>
                    $locations,

                'restaurants_count' =>
                    $result[
                        'restaurants_count'
                    ] ?? null,

                'restaurants' =>
                    $result[
                        'restaurants'
                    ] ?? [],
            ]);
        } catch (Throwable $exception) {
            /*
             * Full exception remains available in Laravel logs.
             */

            report($exception);

            return response()->json([
                'success' => false,

                'message' =>
                    'Unable to test POS connection.',

                'error' =>
                    config('app.debug')
                        ? $exception->getMessage()
                        : null,
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
                    'Toast POS',
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

            /*
            |--------------------------------------------------------------------------
            | Selected POS Merchant / Restaurant
            |--------------------------------------------------------------------------
            |
            | For Toast this contains restaurantGuid selected
            | by the restaurant owner.
            |
            */

            'external_merchant_id' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Toast requires selected restaurant
        |--------------------------------------------------------------------------
        */

        if (
            $validated['provider']
                === 'Toast POS'
            &&
            empty(
                $validated[
                    'external_merchant_id'
                ]
            )
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Please select a Toast restaurant.',
            ], 422);
        }

        try {
            /*
            |--------------------------------------------------------------------------
            | Temporary connection
            |--------------------------------------------------------------------------
            */

            $temporaryConnection =
                new PosConnection();

            $temporaryConnection
                ->restaurant_id =
                $user->restaurant_id;

            $temporaryConnection
                ->provider =
                $validated['provider'];

            $temporaryConnection
                ->label =
                $validated['label'];

            $temporaryConnection
                ->api_key =
                $validated['api_key']
                ?? null;

            $temporaryConnection
                ->access_token =
                $validated['access_token']
                ?? null;

            $temporaryConnection
                ->base_url =
                $validated['base_url'];

            $temporaryConnection
                ->external_merchant_id =
                $validated[
                    'external_merchant_id'
                ] ?? null;

            /*
            |--------------------------------------------------------------------------
            | Resolve provider
            |--------------------------------------------------------------------------
            */

            $provider =
                $posManager->driver(
                    $validated['provider']
                );

            /*
            |--------------------------------------------------------------------------
            | Verify credentials
            |--------------------------------------------------------------------------
            */

            $testResult =
                $provider->testConnection(
                    $temporaryConnection
                );

            if (
                !(
                    $testResult['success']
                    ?? false
                )
            ) {
                return response()->json([
                    'success' => false,

                    'message' =>
                        $this->publicErrorMessage(
                            'POS connection test failed.',
                            $testResult['message']
                                ?? null
                        ),

                    'error' =>
                        config('app.debug')
                            ? (
                                $testResult[
                                    'error'
                                ] ?? null
                            )
                            : null,
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Fetch selected business details
            |--------------------------------------------------------------------------
            */

            $merchant =
                $provider->getMerchant(
                    $temporaryConnection
                );

            $locations =
                $provider->getLocations(
                    $temporaryConnection
                );

            /*
            |--------------------------------------------------------------------------
            | Save atomically
            |--------------------------------------------------------------------------
            */

            $connection =
                DB::transaction(
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

                        $connection =
                            PosConnection::create([
                                'restaurant_id' =>
                                    $user
                                        ->restaurant_id,

                                'provider' =>
                                    $validated[
                                        'provider'
                                    ],

                                'label' =>
                                    $validated[
                                        'label'
                                    ],

                                'api_key' =>
                                    $validated[
                                        'api_key'
                                    ] ?? null,

                                'access_token' =>
                                    $validated[
                                        'access_token'
                                    ] ?? null,

                                'base_url' =>
                                    $validated[
                                        'base_url'
                                    ],

                                /*
                                 * User-selected Toast restaurant
                                 * always has priority.
                                 */

                                'external_merchant_id' =>
                                    $validated[
                                        'external_merchant_id'
                                    ]
                                    ??
                                    $merchant[
                                        'external_merchant_id'
                                    ]
                                    ??
                                    null,

                                'status' =>
                                    'connected',

                                'last_error' =>
                                    null,

                                'last_connected_at' =>
                                    now(),

                                'last_synced_at' =>
                                    null,

                                'is_active' =>
                                    true,
                            ]);

                        /*
                        |--------------------------------------------------------------------------
                        | POS Locations
                        |--------------------------------------------------------------------------
                        */

                        foreach (
                            $locations
                            as $location
                        ) {
                            PosLocation::create([
                                'pos_connection_id' =>
                                    $connection->id,

                                'restaurant_id' =>
                                    $user
                                        ->restaurant_id,

                                'external_location_id' =>
                                    $location[
                                        'external_location_id'
                                    ] ?? null,

                                'external_business_id' =>
                                    $location[
                                        'external_business_id'
                                    ] ?? null,

                                'name' =>
                                    $location[
                                        'name'
                                    ] ?? null,

                                'legal_name' =>
                                    $location[
                                        'legal_name'
                                    ] ?? null,

                                'phone' =>
                                    $location[
                                        'phone'
                                    ] ?? null,

                                'email' =>
                                    $location[
                                        'email'
                                    ] ?? null,

                                'address_line_1' =>
                                    $location[
                                        'address_line_1'
                                    ] ?? null,

                                'address_line_2' =>
                                    $location[
                                        'address_line_2'
                                    ] ?? null,

                                'city' =>
                                    $location[
                                        'city'
                                    ] ?? null,

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
            | Safe response
            |--------------------------------------------------------------------------
            |
            | Never return API key / secret / token.
            |
            */

            return response()->json([
                'success' => true,

                'message' =>
                    'POS connection added successfully.',

                'connection' => [
                    'id' =>
                        $connection->id,

                    'provider' =>
                        $connection->provider,

                    'label' =>
                        $connection->label,

                    'status' =>
                        $connection->status,

                    'external_merchant_id' =>
                        $connection
                            ->external_merchant_id,

                    'last_connected_at' =>
                        $connection
                            ->last_connected_at,

                    'last_synced_at' =>
                        $connection
                            ->last_synced_at,
                ],

                'merchant' =>
                    $merchant,

                'locations' =>
                    $locations,
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,

                'message' =>
                    'Unable to add POS connection.',

                'error' =>
                    config('app.debug')
                        ? $exception->getMessage()
                        : null,
            ], 422);
        }
    }

    /**
     * Delete one POS connection.
     */
    public function destroy(
        Request $request,
        PosConnection $posConnection
    ) {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Restaurant not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Ownership check
        |--------------------------------------------------------------------------
        */

        if (
            (int) $posConnection->restaurant_id
            !==
            (int) $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'POS connection not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Delete
        |--------------------------------------------------------------------------
        */

        $posConnection->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'POS connection deleted successfully.',
        ]);
    }

    /**
     * Synchronize one POS connection.
     */
    public function sync(
    Request $request,
    PosConnection $posConnection,
    PosManager $posManager,
    PosOrderSyncService $orderSyncService,
    \App\Services\POS\PosMenuSyncService $menuSyncService
){
        $user = $request->user();

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

        /*
        |--------------------------------------------------------------------------
        | Ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $posConnection->restaurant_id
            !==
            (int) $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'POS connection not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent simultaneous manual sync
        |--------------------------------------------------------------------------
        |
        | A healthy running sync must not be duplicated.
        | An abandoned sync older than 5 minutes can be recovered.
        |
        */

        $posConnection->refresh();

        if (
            $posConnection->status
            === 'syncing'
        ) {
            $runningLog =
                PosSyncLog::where(
                    'pos_connection_id',
                    $posConnection->id
                )
                    ->where(
                        'status',
                        'running'
                    )
                    ->latest(
                        'started_at'
                    )
                    ->first();

            $isStale =
                !$runningLog
                ||
                !$runningLog
                    ->started_at
                ||
                Carbon::parse(
                    $runningLog
                        ->started_at
                )->lt(
                    now()
                        ->subMinutes(5)
                );

            /*
             * Healthy sync already running.
             */

            if (!$isStale) {
                return response()->json([
                    'success' =>
                        false,

                    'message' =>
                        'This POS connection is already synchronizing.',
                ], 409);
            }

            /*
            |--------------------------------------------------------------------------
            | Recover stale sync
            |--------------------------------------------------------------------------
            */

            if ($runningLog) {
                $runningLog->update([
                    'status' =>
                        'failed',

                    'error_message' =>
                        'Previous synchronization became stale and was automatically recovered.',

                    'completed_at' =>
                        now(),
                ]);
            }

            $posConnection->update([
                'status' =>
                    'error',

                'last_error' =>
                    'Previous synchronization became stale and was recovered.',
            ]);

            $posConnection->refresh();
        }

        /*
        |--------------------------------------------------------------------------
        | Sync log
        |--------------------------------------------------------------------------
        */

        $syncLog =
            PosSyncLog::create([
                'pos_connection_id' =>
                    $posConnection->id,

                'restaurant_id' =>
                    $user->restaurant_id,

                'sync_type' =>
                    'full',

                'status' =>
                    'running',

                'started_at' =>
                    now(),
            ]);

        try {
            $previousSync =
                $posConnection
                    ->last_synced_at;

            $posConnection->update([
                'status' =>
                    'syncing',

                'last_error' =>
                    null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Provider
            |--------------------------------------------------------------------------
            */

            $provider =
                $posManager->driver(
                    $posConnection->provider
                );

            /*
            |--------------------------------------------------------------------------
            | Connection health
            |--------------------------------------------------------------------------
            */

            $testResult =
                $provider->testConnection(
                    $posConnection
                );

            if (
                !(
                    $testResult['success']
                    ?? false
                )
            ) {
                throw new RuntimeException(
                    $testResult['message']
                    ??
                    'POS connection test failed.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Merchant
            |--------------------------------------------------------------------------
            */

            $merchant =
                $provider->getMerchant(
                    $posConnection
                );

            /*
            |--------------------------------------------------------------------------
            | Locations
            |--------------------------------------------------------------------------
            */

            $locations =
                $provider->getLocations(
                    $posConnection
                );

            DB::transaction(
                function () use (
                    $posConnection,
                    $merchant,
                    $locations,
                    $user
                ) {
                    /*
                    |--------------------------------------------------------------------------
                    | Connection merchant details
                    |--------------------------------------------------------------------------
                    */

                    $posConnection->update([
                        'external_merchant_id' =>
                            $posConnection
                                ->external_merchant_id
                            ??
                            (
                                $merchant[
                                    'external_merchant_id'
                                ] ?? null
                            ),

                        'status' =>
                            'syncing',

                        'last_connected_at' =>
                            now(),

                        'last_error' =>
                            null,
                    ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Refresh locations
                    |--------------------------------------------------------------------------
                    */

                    PosLocation::where(
                        'pos_connection_id',
                        $posConnection->id
                    )->delete();

                    foreach (
                        $locations
                        as $location
                    ) {
                        PosLocation::create([
                            'pos_connection_id' =>
                                $posConnection->id,

                            'restaurant_id' =>
                                $user
                                    ->restaurant_id,

                            'external_location_id' =>
                                $location[
                                    'external_location_id'
                                ] ?? null,

                            'external_business_id' =>
                                $location[
                                    'external_business_id'
                                ] ?? null,

                            'name' =>
                                $location[
                                    'name'
                                ] ?? null,

                            'legal_name' =>
                                $location[
                                    'legal_name'
                                ] ?? null,

                            'phone' =>
                                $location[
                                    'phone'
                                ] ?? null,

                            'email' =>
                                $location[
                                    'email'
                                ] ?? null,

                            'address_line_1' =>
                                $location[
                                    'address_line_1'
                                ] ?? null,

                            'address_line_2' =>
                                $location[
                                    'address_line_2'
                                ] ?? null,

                            'city' =>
                                $location[
                                    'city'
                                ] ?? null,

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
                }
            );

            /*
|--------------------------------------------------------------------------
| Fetch + sync POS menu
|--------------------------------------------------------------------------
*/

$menuCategories =
    $provider->getMenu(
        $posConnection->fresh()
    );

$menuResult =
    $menuSyncService->sync(
        $posConnection->fresh(),
        $menuCategories
    );


            /*
            |--------------------------------------------------------------------------
            | Order sync window
            |--------------------------------------------------------------------------
            */

            $end =
                now();

            $start =
                $previousSync
                    ? Carbon::parse(
                        $previousSync
                    )->subMinutes(5)
                    : now()
                        ->subDays(7);

            /*
            |--------------------------------------------------------------------------
            | Fetch normalized orders
            |--------------------------------------------------------------------------
            */

            $orders =
                $provider->getOrders(
                    $posConnection
                        ->fresh(),
                    $start,
                    $end
                );

            /*
            |--------------------------------------------------------------------------
            | Save orders + items + payments
            |--------------------------------------------------------------------------
            */

            $orderResult =
                $orderSyncService->sync(
                    $posConnection
                        ->fresh(),
                    $orders
                );

            /*
            |--------------------------------------------------------------------------
            | Complete connection
            |--------------------------------------------------------------------------
            */

            $posConnection->update([
                'status' =>
                    'connected',

                'last_connected_at' =>
                    now(),

                'last_synced_at' =>
                    $end,

                'last_error' =>
                    null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Complete sync log
            |--------------------------------------------------------------------------
            */

            $syncLog->update([
                'status' =>
                    'success',

                'records_processed' =>
                    $orderResult[
                        'processed'
                    ] ?? 0,

                'records_created' =>
                    $orderResult[
                        'created'
                    ] ?? 0,

                'records_updated' =>
                    $orderResult[
                        'updated'
                    ] ?? 0,

                'records_failed' =>
                    $orderResult[
                        'failed'
                    ] ?? 0,

                'message' =>
                    'POS synchronization completed successfully.',

                'error_message' =>
                    null,

                'meta' => [
                    'locations_processed' =>
                        count($locations),

                    'menu' =>
                        $menuResult,

                    'orders' =>
                        $orderResult,

                    'sync_window' => [
                        'start' =>
                            $start->toIso8601String(),

                        'end' =>
                            $end->toIso8601String(),
                    ],
                ],

                'completed_at' =>
                    now(),
            ]);

            return response()->json([
                'success' =>
                    true,

                'message' =>
                    'POS synchronization completed successfully.',

                'connection' => [
                    'id' =>
                        $posConnection->id,

                    'status' =>
                        'connected',

                    'last_synced_at' =>
                        $posConnection
                            ->fresh()
                            ->last_synced_at,
                ],

                'merchant' =>
                    $merchant,

                'locations' => [
                    'processed' =>
                        count(
                            $locations
                        ),
                ],

                'orders' =>
                    $orderResult,

                'sync_window' => [
                    'start' =>
                        $start
                            ->toIso8601String(),

                    'end' =>
                        $end
                            ->toIso8601String(),
                ],

                'sync_log' => [
                    'id' =>
                        $syncLog->id,

                    'status' =>
                        $syncLog
                            ->fresh()
                            ->status,

                    'records_processed' =>
                        $orderResult[
                            'processed'
                        ] ?? 0,

                    'records_created' =>
                        $orderResult[
                            'created'
                        ] ?? 0,

                    'records_updated' =>
                        $orderResult[
                            'updated'
                        ] ?? 0,

                    'records_failed' =>
                        $orderResult[
                            'failed'
                        ] ?? 0,
                ],
            ]);
        } catch (Throwable $exception) {
            /*
             * Full exception remains in Laravel log.
             */

            report($exception);

            /*
            |--------------------------------------------------------------------------
            | Safe persisted error
            |--------------------------------------------------------------------------
            |
            | Production DB / Sync History should not expose raw internal
            | provider exception details.
            |
            */

            $safeError =
                config('app.debug')
                    ? mb_substr(
                        $exception
                            ->getMessage(),
                        0,
                        1000
                    )
                    : 'POS synchronization failed.';

            $posConnection->update([
                'status' =>
                    'error',

                'last_error' =>
                    $safeError,
            ]);

            $syncLog->update([
                'status' =>
                    'failed',

                'records_failed' =>
                    1,

                'error_message' =>
                    $safeError,

                'completed_at' =>
                    now(),
            ]);

            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'POS synchronization failed.',

                'error' =>
                    config('app.debug')
                        ? $exception
                            ->getMessage()
                        : null,
            ], 422);
        }
    }

    /**
     * Get POS sync history.
     */
    public function syncHistory(
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

        $logs =
            PosSyncLog::where(
                'restaurant_id',
                $user->restaurant_id
            )
                ->with([
                    'connection:id,label,provider',
                ])
                ->latest('id')
                ->limit(25)
                ->get();

        return response()->json([
            'success' => true,

            'logs' =>
                $logs
                    ->map(
                        function (
                            PosSyncLog $log
                        ) {
                            return [
                                'id' =>
                                    $log->id,

                                'pos_connection_id' =>
                                    $log
                                        ->pos_connection_id,

                                'connection_label' =>
                                    $log
                                        ->connection
                                        ?->label,

                                'provider' =>
                                    $log
                                        ->connection
                                        ?->provider,

                                'sync_type' =>
                                    $log
                                        ->sync_type,

                                'status' =>
                                    $log
                                        ->status,

                                'records_processed' =>
                                    $log
                                        ->records_processed,

                                'records_created' =>
                                    $log
                                        ->records_created,

                                'records_updated' =>
                                    $log
                                        ->records_updated,

                                'records_failed' =>
                                    $log
                                        ->records_failed,

                                'message' =>
                                    $log
                                        ->message,

                                /*
                                 * Protect old historical logs too.
                                 *
                                 * In debug/local mode actual errors remain
                                 * visible for development.
                                 *
                                 * Production clients get safe message only.
                                 */

                                'error_message' =>
                                    $log->status
                                        === 'failed'
                                        ? (
                                            config(
                                                'app.debug'
                                            )
                                                ? $log
                                                    ->error_message
                                                : 'POS synchronization failed.'
                                        )
                                        : null,

                                'started_at' =>
                                    $log
                                        ->started_at,

                                'completed_at' =>
                                    $log
                                        ->completed_at,
                            ];
                        }
                    )
                    ->values(),
        ]);
    }

    /**
     * Return detailed provider failure only while debugging.
     */
    private function publicErrorMessage(
        string $fallback,
        ?string $detail = null
    ): string {
        if (
            config('app.debug')
            &&
            is_string($detail)
            &&
            trim($detail) !== ''
        ) {
            return mb_substr(
                trim($detail),
                0,
                1000
            );
        }

        return $fallback;
    }
}