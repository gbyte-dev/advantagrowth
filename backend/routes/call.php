<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Staff\StaffController;

Route::middleware('auth:sanctum')->prefix('staff')->group(function () {

    Route::get('/orders', [
        StaffController::class,
        'orders'
    ]);

});