<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


use App\Jobs\SyncPosConnectionJob;
use App\Models\PosConnection;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    PosConnection::query()
        ->where('is_active', true)
        ->whereIn(
            'status',
            [
                'connected',
                'error',
                'syncing',
            ]
        )
        ->pluck('id')
        ->each(
            function ($connectionId) {
                SyncPosConnectionJob::dispatch(
                    (int) $connectionId
                );
            }
        );
})
    ->name('automatic-pos-sync')
    ->everyFiveMinutes()
    ->withoutOverlapping();


    /*
|--------------------------------------------------------------------------
| SANCTUM TOKEN CLEANUP
|--------------------------------------------------------------------------
|
| Remove old expired personal access tokens from the database.
|
*/

Schedule::command(
    'sanctum:prune-expired --hours=24'
)
    ->name(
        'sanctum-token-cleanup'
    )
    ->daily()
    ->withoutOverlapping();