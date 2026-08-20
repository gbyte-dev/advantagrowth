<?php

namespace Tests\Feature;

use App\Jobs\SyncPosConnectionJob;
use App\Models\PosConnection;
use App\Models\PosSyncLog;
use App\Models\Restaurant;
use App\Services\POS\PosManager;
use App\Services\POS\PosOrderSyncService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PosQueueRecoveryTest extends TestCase
{
    use RefreshDatabase;

    private function createConnection(
        string $status = 'connected'
    ): PosConnection {
        $restaurant = Restaurant::create([
            'name' => 'Queue Test Restaurant',
            'slug' => 'queue-test-restaurant',
            'phone' => '9999999999',
            'email' => 'queue-test@example.com',
            'is_active' => true,
        ]);

        return PosConnection::create([
            'restaurant_id' =>
                $restaurant->id,

            'provider' =>
                'Custom API',

            'label' =>
                'Queue Test POS',

            'base_url' =>
                'http://127.0.0.1:8000/api/mock-pos',

            'external_merchant_id' =>
                'merchant_demo_001',

            'status' =>
                $status,

            'is_active' =>
                true,
        ]);
    }

    public function test_job_has_expected_retry_configuration(): void
    {
        $job =
            new SyncPosConnectionJob(123);

        $this->assertSame(
            3,
            $job->tries
        );

        $this->assertSame(
            180,
            $job->timeout
        );

        $this->assertSame(
            [30, 90],
            $job->backoff
        );

        $this->assertTrue(
            $job->retryUntil()
                ->greaterThan(now())
        );
    }

    public function test_healthy_running_sync_is_not_recovered(): void
    {
        $connection =
            $this->createConnection(
                'syncing'
            );

        $runningLog =
            PosSyncLog::create([
                'pos_connection_id' =>
                    $connection->id,

                'restaurant_id' =>
                    $connection
                        ->restaurant_id,

                'sync_type' =>
                    'automatic',

                'status' =>
                    'running',

                'started_at' =>
                    now()->subMinute(),
            ]);

        $posManager =
            Mockery::mock(
                PosManager::class
            );

        $orderSyncService =
            Mockery::mock(
                PosOrderSyncService::class
            );

        /*
         * If healthy sync is detected,
         * provider must never be resolved.
         */
        $posManager
            ->shouldNotReceive(
                'driver'
            );

        $job =
            new SyncPosConnectionJob(
                $connection->id
            );

        $job->handle(
            $posManager,
            $orderSyncService
        );

        $this->assertSame(
            'syncing',
            $connection
                ->fresh()
                ->status
        );

        $this->assertSame(
            'running',
            $runningLog
                ->fresh()
                ->status
        );

        $this->assertNull(
            $runningLog
                ->fresh()
                ->completed_at
        );
    }

    public function test_stale_running_sync_is_recovered_before_new_sync_attempt(): void
    {
        Carbon::setTestNow(
            Carbon::parse(
                '2026-08-20 12:30:00'
            )
        );

        $connection =
            $this->createConnection(
                'syncing'
            );

        $staleLog =
            PosSyncLog::create([
                'pos_connection_id' =>
                    $connection->id,

                'restaurant_id' =>
                    $connection
                        ->restaurant_id,

                'sync_type' =>
                    'automatic',

                'status' =>
                    'running',

                'started_at' =>
                    now()
                        ->subMinutes(10),
            ]);

        /*
         * Force provider resolution to fail
         * AFTER stale recovery has happened.
         *
         * This lets us test stale recovery
         * without making real HTTP requests.
         */
        $posManager =
            Mockery::mock(
                PosManager::class
            );

        $posManager
            ->shouldReceive(
                'driver'
            )
            ->once()
            ->andThrow(
                new \RuntimeException(
                    'Test provider failure.'
                )
            );

        $orderSyncService =
            Mockery::mock(
                PosOrderSyncService::class
            );

        $job =
            new SyncPosConnectionJob(
                $connection->id
            );

        try {
            $job->handle(
                $posManager,
                $orderSyncService
            );
        } catch (\RuntimeException $exception) {
            $this->assertSame(
                'Test provider failure.',
                $exception->getMessage()
            );
        }

        $staleLog->refresh();

        $this->assertSame(
            'failed',
            $staleLog->status
        );

        $this->assertNotNull(
            $staleLog->completed_at
        );

        $this->assertStringContainsString(
            'automatically recovered',
            (string)
                $staleLog
                    ->error_message
        );

        /*
         * The new sync attempt itself failed,
         * so final connection status should be error.
         */
        $connection->refresh();

        $this->assertSame(
            'error',
            $connection->status
        );

        /*
         * New automatic sync log should exist
         * and be marked failed.
         */
        $latestLog =
            PosSyncLog::where(
                'pos_connection_id',
                $connection->id
            )
                ->latest('id')
                ->first();

        $this->assertNotNull(
            $latestLog
        );

        $this->assertNotSame(
            $staleLog->id,
            $latestLog->id
        );

        $this->assertSame(
            'automatic',
            $latestLog->sync_type
        );

        $this->assertSame(
            'failed',
            $latestLog->status
        );

        Carbon::setTestNow();
    }

    public function test_failed_callback_clears_running_logs_and_sets_connection_error(): void
    {
        $connection =
            $this->createConnection(
                'syncing'
            );

        $runningLog =
            PosSyncLog::create([
                'pos_connection_id' =>
                    $connection->id,

                'restaurant_id' =>
                    $connection
                        ->restaurant_id,

                'sync_type' =>
                    'automatic',

                'status' =>
                    'running',

                'started_at' =>
                    now(),
            ]);

        $job =
            new SyncPosConnectionJob(
                $connection->id
            );

        $job->failed(
            new \RuntimeException(
                'Final retry failure.'
            )
        );

        $connection->refresh();

        $runningLog->refresh();

        $this->assertSame(
            'error',
            $connection->status
        );

        $this->assertSame(
            'Final retry failure.',
            $connection->last_error
        );

        $this->assertSame(
            'failed',
            $runningLog->status
        );

        $this->assertSame(
            'Final retry failure.',
            $runningLog
                ->error_message
        );

        $this->assertNotNull(
            $runningLog
                ->completed_at
        );
    }
}