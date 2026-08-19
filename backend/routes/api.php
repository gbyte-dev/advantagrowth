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
/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/
require base_path('routes/superWeb.php');

require base_path('routes/call.php');

Route::prefix('auth')->group(function () {

    // Owner Register
    Route::post('/register', [
        AuthController::class,
        'register'
    ]);

    // Owner Login
    Route::post('/login', [
        AuthController::class,
        'login'
    ]);

    // Staff Login
    Route::post('/staff/login', [
        StaffController::class,
        'login'
    ]);

    // Super Admin Login
    Route::post('/superadmin/login', [
        AuthController::class,
        'superAdminLogin'
    ]);

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED OWNER / STAFF ROUTES
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
| CONTACT MESSAGES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')
    ->prefix('contact')
    ->group(function () {

        // Owner gets contact messages
        Route::get('/messages', [
            ContactController::class,
            'messages'
        ]);

        // Owner read / unread
        Route::patch('/messages/{id}/read', [
            ContactController::class,
            'toggleMessageRead'
        ]);

        // Owner deletes message
        Route::delete('/messages/{id}', [
            ContactController::class,
            'destroyMessage'
        ]);
    });




/*
|--------------------------------------------------------------------------
| PUBLIC RESTAURANT ROUTES
|--------------------------------------------------------------------------
*/

// All active restaurants
Route::get('/restaurants', [
    RestaurantController::class,
    'index'
]);

// Single restaurant
Route::get('/restaurants/{slug}', [
    RestaurantController::class,
    'show'
]);

// Restaurant menu
Route::get('/restaurants/{slug}/menu', [
    RestaurantController::class,
    'menu'
]);

// Restaurant visible reviews
Route::get('/restaurants/{slug}/reviews', [
    ReviewController::class,
    'restaurantReviews'
]);

// Public customer review submission
Route::post('/restaurants/reviews', [
    ReviewController::class,
    'store'
]);

// Restaurant staff
Route::get('/restaurants/{slug}/staff', [
    RestaurantController::class,
    'staff'
]);


/*
|--------------------------------------------------------------------------
| PUBLIC CUSTOMER CONTACT FORM
|--------------------------------------------------------------------------
*/

// Customer does NOT need login
Route::post('/contact/messages', [
    ContactController::class,
    'storeMessage'
]);


/*
|--------------------------------------------------------------------------
| RESERVATION ROUTES
|--------------------------------------------------------------------------
*/

// Customer reservation
Route::post('/reservations', [
    ReservationController::class,
    'store'
]);

// Owner reservation management
Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/owner/reservations',
        [ReservationController::class, 'ownerReservations']
    );

    Route::patch(
        '/owner/reservations/{reservation}/status',
        [ReservationController::class, 'updateStatus']
    );
});



/*
|--------------------------------------------------------------------------
| OWNER - MARQUEE / HERO / PROFILE
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | RESTAURANT PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get(
    '/restaurant/profile',
    [RestaurantController::class, 'profile']
);

    Route::put(
        '/restaurant/profile',
        [RestaurantController::class, 'updateProfile']
    );
});




Route::middleware('auth:sanctum')->prefix('owner')->group(function () {
    Route::get('/orders', [OwnerOrderController::class, 'index']);
    Route::get('/orders/{order}', [OwnerOrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OwnerOrderController::class, 'updateStatus']);
});