<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Staff\StaffController;
use App\Http\Controllers\Api\Restaurant\RestaurantController;
use App\Http\Controllers\Api\Review\ReviewController;
use App\Http\Controllers\Api\Contact\ContactController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\POS\MockPosController;


/*
|--------------------------------------------------------------------------
| EXTRA ROUTE FILES
|--------------------------------------------------------------------------
*/

require base_path('routes/superWeb.php');

/*
|--------------------------------------------------------------------------
| OWNER ROUTES
|--------------------------------------------------------------------------
|
| Owner-specific application routes are kept separately
| inside routes/call.php.
|
*/

require base_path('routes/call.php');


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
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | PUBLIC AUTH
    |--------------------------------------------------------------------------
    */

    Route::post('/register', [
        AuthController::class,
        'register'
    ]);

    Route::post('/login', [
        AuthController::class,
        'login'
    ]);

    Route::post('/staff/login', [
        StaffController::class,
        'login'
    ]);

    Route::post('/superadmin/login', [
        AuthController::class,
        'superAdminLogin'
    ]);


    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED COMMON AUTH
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [
            AuthController::class,
            'logout'
        ]);

        Route::get('/me', [
            AuthController::class,
            'me'
        ]);

        Route::put('/profile', [
            AuthController::class,
            'updateProfile'
        ]);

        Route::put('/change-password', [
            AuthController::class,
            'changePassword'
        ]);


        /*
        |--------------------------------------------------------------------------
        | STAFF SELF ACCOUNT
        |--------------------------------------------------------------------------
        |
        | Owner staff-management CRUD lives in call.php.
        |
        */

        Route::get('/staff/me', [
            StaffController::class,
            'me'
        ]);

        Route::post('/staff/logout', [
            StaffController::class,
            'logout'
        ]);
    });
});


/*
|--------------------------------------------------------------------------
| STAFF AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('staff')
    ->group(function () {

        Route::get('/orders', [
            StaffController::class,
            'orders'
        ]);
    });


/*
|--------------------------------------------------------------------------
| PUBLIC RESTAURANT ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/restaurants', [
    RestaurantController::class,
    'index'
]);

Route::get('/restaurants/{slug}', [
    RestaurantController::class,
    'show'
]);

Route::get('/restaurants/{slug}/menu', [
    RestaurantController::class,
    'menu'
]);

Route::get('/restaurants/{slug}/reviews', [
    ReviewController::class,
    'restaurantReviews'
]);

Route::post('/restaurants/reviews', [
    ReviewController::class,
    'store'
]);

Route::get('/restaurants/{slug}/staff', [
    RestaurantController::class,
    'staff'
]);


/*
|--------------------------------------------------------------------------
| PUBLIC CUSTOMER CONTACT
|--------------------------------------------------------------------------
*/

Route::post('/contact/messages', [
    ContactController::class,
    'storeMessage'
]);


/*
|--------------------------------------------------------------------------
| PUBLIC RESERVATION
|--------------------------------------------------------------------------
*/

Route::post('/reservations', [
    ReservationController::class,
    'store'
]);


/*
|--------------------------------------------------------------------------
| MOCK POS API
|--------------------------------------------------------------------------
|
| DEVELOPMENT / TESTING ONLY.
|
| These routes intentionally stay outside authentication because
| the Advanta backend uses them like an external POS service.
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
| MOCK RESTOLUTION API
|--------------------------------------------------------------------------
|
| Development/testing only.
|
*/

Route::post('/mock-restolution', [
    MockPosController::class,
    'restolution'
]);