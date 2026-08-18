<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SupAdmin\RestaurantsController;

/*
|--------------------------------------------------------------------------
| SUPER ADMIN - RESTAURANTS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('superadmin')->group(function () {

    Route::prefix('restaurants')->group(function () {

        Route::get('/', [
            RestaurantsController::class,
            'index'
        ]);

        Route::post('/', [
            RestaurantsController::class,
            'store'
        ]);

        Route::get('/{id}', [
            RestaurantsController::class,
            'show'
        ]);

        Route::put('/{id}', [
            RestaurantsController::class,
            'update'
        ]);

        Route::delete('/{id}', [
            RestaurantsController::class,
            'destroy'
        ]);
    });
});
