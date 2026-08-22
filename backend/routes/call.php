<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Menu\MenuController;
use App\Http\Controllers\Api\POS\MockPosController;
use App\Http\Controllers\Api\Staff\StaffController;
use App\Http\Controllers\Api\Owner\AnalyticsController;
use App\Http\Controllers\Api\Owner\WeatherController;

/*
|--------------------------------------------------------------------------
| DEVELOPMENT PASSWORD RESET
|--------------------------------------------------------------------------
|
| No email / OTP yet.
| Controller itself blocks this endpoint outside local/testing.
|
*/

Route::post('/auth/reset-password', [
    AuthController::class,
    'resetPasswordDev'
]);


/*
|--------------------------------------------------------------------------
| MOCK POS ROUTES
|--------------------------------------------------------------------------
|
| Development/testing only.
| These routes intentionally stay outside auth middleware
| because the Advanta backend calls them like an external POS API.
|
*/

Route::prefix('mock-pos')->group(function () {

    Route::get('/restaurant', [
        MockPosController::class,
        'restaurant'
    ]);

    Route::get('/locations', [
        MockPosController::class,
        'locations'
    ]);

    Route::get('/menu', [
        MockPosController::class,
        'menu'
    ]);

    Route::get('/orders', [
        MockPosController::class,
        'orders'
    ]);
});

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | STAFF
    |--------------------------------------------------------------------------
    */

    Route::prefix('staff')->group(function () {

        Route::get('/orders', [
            StaffController::class,
            'orders'
        ]);

    });

    /*
    |--------------------------------------------------------------------------
    | OWNER MENU MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::prefix('auth/menu')->group(function () {

        Route::get('/', [
            MenuController::class,
            'index'
        ]);

        Route::post('/categories', [
            MenuController::class,
            'storeCategory'
        ]);

        Route::put('/categories/{id}', [
            MenuController::class,
            'updateCategory'
        ]);

        Route::delete('/categories/{id}', [
            MenuController::class,
            'destroyCategory'
        ]);

        Route::post('/items', [
            MenuController::class,
            'storeItem'
        ]);

        Route::put('/items/{id}', [
            MenuController::class,
            'updateItem'
        ]);

        Route::delete('/items/{id}', [
            MenuController::class,
            'destroyItem'
        ]);

        Route::patch('/items/{id}/availability', [
            MenuController::class,
            'toggleItemAvailability'
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | OWNER ACCOUNT
    |--------------------------------------------------------------------------
    */

    Route::delete('/auth/account', [
        AuthController::class,
        'deleteAccount'
    ]);


    /*
|--------------------------------------------------------------------------
| OWNER ANALYTICS
|--------------------------------------------------------------------------
*/

    Route::get('/owner/analytics', [
        AnalyticsController::class,
        'overview'
    ]);

    /*
        |--------------------------------------------------------------------------
        | OWNER WEATHER
        |--------------------------------------------------------------------------
        */

        Route::get('/owner/weather', [
            WeatherController::class,
            'overview'
        ]);
});