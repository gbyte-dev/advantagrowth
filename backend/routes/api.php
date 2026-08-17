<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\CustomerAuthController;
use App\Http\Controllers\Api\Staff\StaffController;
use App\Http\Controllers\Api\Menu\MenuController;
use App\Http\Controllers\Api\Restaurant\RestaurantController;
use App\Http\Controllers\Api\Review\ReviewController;
use App\Http\Controllers\Api\Contact\ContactController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\Owner\RestaurantStoryController;
use App\Http\Controllers\Api\Owner\RestaurantAboutController;
use App\Http\Controllers\Api\Restaurant\MarqueeController;
use App\Http\Controllers\Api\Restaurant\OwnerHeroController;
use App\Http\Controllers\Api\Customer\OrderController;
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

        /*
        |--------------------------------------------------------------------------
        | OWNER - CONTACT MESSAGES
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/owner/restaurant/about',
            [RestaurantAboutController::class, 'show']
        );

        Route::post(
            '/owner/restaurant/about',
            [RestaurantAboutController::class, 'update']
        );
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
| CUSTOMER AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::prefix('customer')->group(function () {

    // Customer Register
    Route::post('/register', [
        CustomerAuthController::class,
        'register'
    ]);

    // Customer Login
    Route::post('/login', [
        CustomerAuthController::class,
        'login'
    ]);

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER AUTHENTICATED ROUTES
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        // Customer Logout
        Route::post('/logout', [
            CustomerAuthController::class,
            'logout'
        ]);

        // Customer Profile
        Route::get('/me', [
            CustomerAuthController::class,
            'me'
        ]);

        // Customer Submit Review
        Route::post('/reviews', [
            ReviewController::class,
            'store'
        ]);
    });
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

// Restaurant marquee - PUBLIC
Route::get('/restaurants/{slug}/marquee', [
    RestaurantController::class,
    'marquee'
]);

// Restaurant visible reviews
Route::get('/restaurants/{slug}/reviews', [
    ReviewController::class,
    'restaurantReviews'
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
| OWNER - RESTAURANT STORY / ABOUT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/owner/restaurant/story',
        [RestaurantStoryController::class, 'show']
    );

    Route::post(
        '/owner/restaurant/story',
        [RestaurantStoryController::class, 'update']
    );

    Route::post(
        '/restaurant/about',
        [RestaurantController::class, 'updateAbout']
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
    | OWNER MARQUEE
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/owner/marquee',
        [MarqueeController::class, 'index']
    );

    Route::post(
        '/owner/marquee',
        [MarqueeController::class, 'store']
    );

    Route::put(
        '/owner/marquee/{marquee}',
        [MarqueeController::class, 'update']
    );

    Route::delete(
        '/owner/marquee/{marquee}',
        [MarqueeController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | OWNER HERO
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/owner/hero',
        [OwnerHeroController::class, 'show']
    );

    Route::post(
        '/owner/hero',
        [OwnerHeroController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | RESTAURANT PROFILE
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/restaurant/profile',
        [RestaurantController::class, 'updateProfile']
    );
});



Route::post('/orders', [OrderController::class, 'store']);

Route::get('/orders/{order}', [OrderController::class, 'show']);
Route::post('/orders/{order}/payment', [
    \App\Http\Controllers\Api\Customer\OrderController::class,
    'createPayment',
]);

Route::post('/orders/{order}/payment/verify', [
    \App\Http\Controllers\Api\Customer\OrderController::class,
    'verifyPayment',
]);



Route::middleware('auth:sanctum')->prefix('owner')->group(function () {
    Route::get('/orders', [OwnerOrderController::class, 'index']);
    Route::get('/orders/{order}', [OwnerOrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OwnerOrderController::class, 'updateStatus']);
    Route::get('/owner/orders', [OrderController::class, 'ownerOrders']);
});