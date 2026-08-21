<?php

namespace App\Jobs;

use App\Models\PosConnection;
use App\Models\PosLocation;
use App\Models\PosSyncLog;
use App\Services\POS\PosManager;
use App\Services\POS\PosOrderSyncService;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class SyncPosConnectionJob implements ShouldQueue
{
    use Queueable;

    /*
    |--------------------------------------------------------------------------
    | Queue configuration
    |--------------------------------------------------------------------------
    */

    public int $tries = 3;

    public int $timeout = 180;

    public array $backoff = [
        30,
        90,
    ];

    public function __construct(
        public int $posConnectionId
    ) {
    }

    /**
     * Stop retrying after 10 minutes.
     */
    public function retryUntil(): DateTimeInterface
    {
        return now()->addMinutes(10);
    }

    /**
     * Process POS synchronization.
     */
    public function handle(
        PosManager $posManager,
        PosOrderSyncService $orderSyncService
    ): void {
        $posConnection =
            PosConnection::find(
                $this->posConnectionId
            );

        /*
        |--------------------------------------------------------------------------
        | Connection existence / active check
        |--------------------------------------------------------------------------
        */

        if (!$posConnection) {
            return;
        }

        if (!$posConnection->is_active) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Existing syncing state
        |--------------------------------------------------------------------------
        |
        | If another healthy sync is already running, this queued job exits.
        |
        | If the running sync is older than 5 minutes, assume the worker
        | crashed and recover the stale state.
        |
        */

        if ($posConnection->status === 'syncing') {
            $runningLog =
                PosSyncLog::where(
                    'pos_connection_id',
                    $posConnection->id
                )
                    ->where(
                        'status',
                        'running'
                    )
                    ->latest('started_at')
                    ->first();

            $isStale =
                !$runningLog ||
                !$runningLog->started_at ||
                Carbon::parse(
                    $runningLog->started_at
                )->lt(
                    now()->subMinutes(5)
                );

            /*
             * Healthy sync already running.
             *
             * IMPORTANT:
             * Queue Job handle() returns void.
             * Never return an HTTP response here.
             */

            if (!$isStale) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Recover stale running log
            |--------------------------------------------------------------------------
            */

            if ($runningLog) {
                $runningLog->update([
                    'status' =>
                        'failed',

                    'error_message' =>
                        'Previous synchronization was automatically recovered after becoming stale.',

                    'completed_at' =>
                        now(),
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Recover stale connection state
            |--------------------------------------------------------------------------
            */

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
        | Create log for this automatic sync attempt
        |--------------------------------------------------------------------------
        */

        $syncLog =
            PosSyncLog::create([
                'pos_connection_id' =>
                    $posConnection->id,

                'restaurant_id' =>
                    $posConnection->restaurant_id,

                'sync_type' =>
                    'automatic',

                'status' =>
                    'running',

                'started_at' =>
                    now(),
            ]);

        try {
            $previousSync =
                $posConnection
                    ->last_synced_at;

            /*
            |--------------------------------------------------------------------------
            | Mark connection as syncing
            |--------------------------------------------------------------------------
            */

            $posConnection->update([
                'status' =>
                    'syncing',

                'last_error' =>
                    null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Resolve POS provider
            |--------------------------------------------------------------------------
            */

            $provider =
                $posManager->driver(
                    $posConnection->provider
                );

            /*
            |--------------------------------------------------------------------------
            | Verify POS connection
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
                    ?? 'POS connection test failed.'
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

            /*
            |--------------------------------------------------------------------------
            | Save merchant + locations atomically
            |--------------------------------------------------------------------------
            */

            DB::transaction(
                function () use (
                    $posConnection,
                    $merchant,
                    $locations
                ) {
                    /*
                    |--------------------------------------------------------------------------
                    | Connection details
                    |--------------------------------------------------------------------------
                    */

                    $posConnection->update([
                        /*
                         * Preserve selected merchant / Toast restaurant GUID.
                         */

                        'external_merchant_id' =>
                            $posConnection
                                ->external_merchant_id
                            ??
                            (
                                $merchant[
                                    'external_merchant_id'
                                ]
                                ?? null
                            ),

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
                        $locations as $location
                    ) {
                        PosLocation::create([
                            'pos_connection_id' =>
                                $posConnection->id,

                            'restaurant_id' =>
                                $posConnection
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
            | Incremental synchronization window
            |--------------------------------------------------------------------------
            */

            $end = now();

            $start =
                $previousSync
                    ? Carbon::parse(
                        $previousSync
                    )->subMinutes(5)
                    : now()->subDays(7);

            /*
            |--------------------------------------------------------------------------
            | Fetch normalized POS orders
            |--------------------------------------------------------------------------
            */

            $orders =
                $provider->getOrders(
                    $posConnection->fresh(),
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
                    $posConnection->fresh(),
                    $orders
                );

            /*
            |--------------------------------------------------------------------------
            | Connection success
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
            | Sync log success
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
                    'Automatic POS synchronization completed successfully.',

                'error_message' =>
                    null,

                'meta' => [
                    'locations_processed' =>
                        count($locations),

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
                ],

                'completed_at' =>
                    now(),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            $safeMessage =
                $this->safeErrorMessage(
                    $exception
                );

            /*
            |--------------------------------------------------------------------------
            | Connection failure
            |--------------------------------------------------------------------------
            */

            $posConnection->update([
                'status' =>
                    'error',

                'last_error' =>
                    $safeMessage,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Sync log failure
            |--------------------------------------------------------------------------
            */

            $syncLog->update([
                'status' =>
                    'failed',

                'records_failed' =>
                    1,

                'error_message' =>
                    $safeMessage,

                'completed_at' =>
                    now(),
            ]);

            /*
             * Required so Laravel queue retries the job.
             */

            throw $exception;
        }
    }

    /**
     * Called after Laravel exhausts all retry attempts.
     */
    public function failed(
        ?Throwable $exception
    ): void {
        $posConnection =
            PosConnection::find(
                $this->posConnectionId
            );

        if (!$posConnection) {
            return;
        }

        $message =
            $exception
                ? $this->safeErrorMessage(
                    $exception
                )
                : 'POS synchronization permanently failed after all retry attempts.';

        /*
        |--------------------------------------------------------------------------
        | Final connection state
        |--------------------------------------------------------------------------
        */

        $posConnection->update([
            'status' =>
                'error',

            'last_error' =>
                $message,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Cleanup abandoned running logs
        |--------------------------------------------------------------------------
        */

        PosSyncLog::where(
            'pos_connection_id',
            $posConnection->id
        )
            ->where(
                'status',
                'running'
            )
            ->update([
                'status' =>
                    'failed',

                'error_message' =>
                    $message,

                'completed_at' =>
                    now(),
            ]);
    }

    /**
     * Limit stored exception text.
     */
    private function safeErrorMessage(
        Throwable $exception
    ): string {
        $message =
            trim(
                $exception->getMessage()
            );

        if ($message === '') {
            return 'POS synchronization failed.';
        }

        return mb_substr(
            $message,
            0,
            1000
        );
    }
}