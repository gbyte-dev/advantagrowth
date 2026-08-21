<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Staff\StaffController;
use App\Http\Controllers\Api\Menu\MenuController;
use App\Http\Controllers\Api\Restaurant\RestaurantController;
use App\Http\Controllers\Api\Review\ReviewController;
use App\Http\Controllers\Api\Contact\ContactController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\Owner\OrderController as OwnerOrderController;
use App\Http\Controllers\Api\POS\PosConnectionController;
use App\Http\Controllers\Api\POS\MockPosController;


/*
|--------------------------------------------------------------------------
| EXTRA ROUTE FILES
|--------------------------------------------------------------------------
*/

require base_path('routes/superWeb.php');
require base_path('routes/call.php');


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
    | AUTHENTICATED AUTH ROUTES
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | COMMON AUTH
        |--------------------------------------------------------------------------
        */

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
        | STAFF MANAGEMENT
        |--------------------------------------------------------------------------
        */

        Route::prefix('staff')->group(function () {

            Route::get('/', [
                StaffController::class,
                'index'
            ]);

            Route::post('/', [
                StaffController::class,
                'store'
            ]);

            Route::put('/{id}', [
                StaffController::class,
                'update'
            ]);

            Route::delete('/{id}', [
                StaffController::class,
                'destroy'
            ]);

            Route::patch('/{id}/status', [
                StaffController::class,
                'toggleStatus'
            ]);

            Route::patch('/{id}/password', [
                StaffController::class,
                'resetPassword'
            ]);

            Route::get('/me', [
                StaffController::class,
                'me'
            ]);

            Route::post('/logout', [
                StaffController::class,
                'logout'
            ]);
        });


        /*
        |--------------------------------------------------------------------------
        | MENU MANAGEMENT
        |--------------------------------------------------------------------------
        */

        Route::prefix('menu')->group(function () {

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
        | OWNER - REVIEWS
        |--------------------------------------------------------------------------
        */

        Route::prefix('reviews')->group(function () {

            Route::get('/', [
                ReviewController::class,
                'index'
            ]);

            Route::patch('/{id}/visibility', [
                ReviewController::class,
                'toggleVisibility'
            ]);

            Route::delete('/{id}', [
                ReviewController::class,
                'destroy'
            ]);
        });
    });
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
| OWNER CONTACT MESSAGES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('contact')
    ->group(function () {

        Route::get('/messages', [
            ContactController::class,
            'messages'
        ]);

        Route::patch('/messages/{id}/read', [
            ContactController::class,
            'toggleMessageRead'
        ]);

        Route::delete('/messages/{id}', [
            ContactController::class,
            'destroyMessage'
        ]);
    });


/*
|--------------------------------------------------------------------------
| RESERVATIONS
|--------------------------------------------------------------------------
*/

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
| OWNER RESERVATIONS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/owner/reservations',
        [
            ReservationController::class,
            'ownerReservations'
        ]
    );

    Route::patch(
        '/owner/reservations/{reservation}/status',
        [
            ReservationController::class,
            'updateStatus'
        ]
    );
});


/*
|--------------------------------------------------------------------------
| RESTAURANT PROFILE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/restaurant/profile',
        [
            RestaurantController::class,
            'profile'
        ]
    );

    Route::put(
        '/restaurant/profile',
        [
            RestaurantController::class,
            'updateProfile'
        ]
    );
});


/*
|--------------------------------------------------------------------------
| MOCK POS API
|--------------------------------------------------------------------------
|
| DEVELOPMENT ONLY.
|
| IMPORTANT:
| These routes MUST NOT be inside owner prefix/auth middleware.
|
| URLs:
| GET /api/mock-pos/restaurant
| GET /api/mock-pos/locations
|
*/

Route::prefix('mock-pos')->group(function () {

    Route::get('/restaurant', [
        MockPosController::class,
        'restaurant'
    ]);

    Route::get(
        '/orders',
        [MockPosController::class, 'orders']
    );

    Route::get('/locations', [
        MockPosController::class,
        'locations'
    ]);

    
});


/*
|--------------------------------------------------------------------------
| AUTHENTICATED OWNER ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('owner')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | OWNER ORDERS
        |--------------------------------------------------------------------------
        */

        Route::get('/orders', [
            OwnerOrderController::class,
            'index'
        ]);

        Route::get('/orders/{order}', [
            OwnerOrderController::class,
            'show'
        ]);

        Route::patch('/orders/{order}/status', [
            OwnerOrderController::class,
            'updateStatus'
        ]);


  /*
|--------------------------------------------------------------------------
| POS CONNECTIONS
|--------------------------------------------------------------------------
*/

Route::get('/pos-connections', [
    PosConnectionController::class,
    'index'
]);

Route::post('/pos-connections/test', [
    PosConnectionController::class,
    'testConnection'
]);

Route::post('/pos-connections', [
    PosConnectionController::class,
    'store'
]);

Route::post(
    '/pos-connections/{posConnection}/sync',
    [PosConnectionController::class, 'sync']
);

Route::get(
    '/pos-sync-history',
    [PosConnectionController::class, 'syncHistory']
);

Route::delete('/pos-connections/{posConnection}', [
    PosConnectionController::class,
    'destroy'
]);
    });