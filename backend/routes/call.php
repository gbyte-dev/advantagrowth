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
use App\Http\Controllers\Api\Owner\AnalyticsController;
use App\Http\Controllers\Api\Owner\WeatherController;
use App\Http\Controllers\Api\Owner\HolidayController;
use App\Http\Controllers\Api\POS\PosConnectionController;
use App\Http\Controllers\Api\Owner\OwnerSubscriptionController;
use App\Http\Controllers\Api\Owner\OwnerSubscriptionPaymentController;
use App\Http\Controllers\Api\Owner\RecommendationController;


/*
|--------------------------------------------------------------------------
| OWNER AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
|
| All routes in this file belong to restaurant owner functionality.
|
*/

Route::middleware([
    'auth:sanctum',
    'active.subscription',
])->group(function () {

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
    | OWNER STAFF MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | URLs remain:
    |
    | GET    /api/auth/staff
    | POST   /api/auth/staff
    | PUT    /api/auth/staff/{id}
    | DELETE /api/auth/staff/{id}
    |
    */

    Route::prefix('auth/staff')->group(function () {

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
    });


    /*
    |--------------------------------------------------------------------------
    | OWNER MENU MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | URLs remain:
    |
    | /api/auth/menu/*
    |
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
    | OWNER REVIEWS
    |--------------------------------------------------------------------------
    |
    | URLs remain:
    |
    | /api/auth/reviews/*
    |
    */

    Route::prefix('auth/reviews')->group(function () {

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
    | OWNER CONTACT MESSAGES
    |--------------------------------------------------------------------------
    */

    Route::prefix('contact')->group(function () {

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
    | OWNER RESERVATIONS
    |--------------------------------------------------------------------------
    */

    Route::get('/owner/reservations', [
        ReservationController::class,
        'ownerReservations'
    ]);

    Route::patch(
        '/owner/reservations/{reservation}/status',
        [
            ReservationController::class,
            'updateStatus'
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | OWNER RESTAURANT PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/restaurant/profile', [
        RestaurantController::class,
        'profile'
    ]);

    Route::put('/restaurant/profile', [
        RestaurantController::class,
        'updateProfile'
    ]);


    /*
    |--------------------------------------------------------------------------
    | OWNER ORDERS
    |--------------------------------------------------------------------------
    */

    Route::get('/owner/orders', [
        OwnerOrderController::class,
        'index'
    ]);

    Route::get('/owner/orders/{order}', [
        OwnerOrderController::class,
        'show'
    ]);

    Route::patch('/owner/orders/{order}/status', [
        OwnerOrderController::class,
        'updateStatus'
    ]);


    /*
    |--------------------------------------------------------------------------
    | OWNER POS CONNECTIONS
    |--------------------------------------------------------------------------
    */

    Route::get('/owner/pos-connections', [
        PosConnectionController::class,
        'index'
    ]);

    Route::post('/owner/pos-connections/test', [
        PosConnectionController::class,
        'testConnection'
    ]);

    Route::post('/owner/pos-connections', [
        PosConnectionController::class,
        'store'
    ]);

    Route::post(
        '/owner/pos-connections/{posConnection}/sync',
        [
            PosConnectionController::class,
            'sync'
        ]
    );

    Route::get('/owner/pos-sync-history', [
        PosConnectionController::class,
        'syncHistory'
    ]);

    Route::delete(
        '/owner/pos-connections/{posConnection}',
        [
            PosConnectionController::class,
            'destroy'
        ]
    );


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
    | OWNER AI RECOMMENDATIONS
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/owner/recommendations',
        [
            RecommendationController::class,
            'index',
        ]
    );

    Route::post(
        '/owner/recommendations/generate',
        [
            RecommendationController::class,
            'generate',
        ]
    )->middleware('throttle:3,60');

    /*
    |--------------------------------------------------------------------------
    | OWNER WEATHER
    |--------------------------------------------------------------------------
    */

    Route::get('/owner/weather', [
        WeatherController::class,
        'overview'
    ]);


    /*
    |--------------------------------------------------------------------------
    | OWNER HOLIDAYS
    |--------------------------------------------------------------------------
    */

    Route::get('/owner/holidays', [
        HolidayController::class,
        'index'
    ]);

    Route::post('/owner/holidays', [
        HolidayController::class,
        'store'
    ]);

    Route::put('/owner/holidays/{id}', [
        HolidayController::class,
        'update'
    ]);

    Route::delete('/owner/holidays/{id}', [
        HolidayController::class,
        'destroy'
    ]);


Route::get('/owner/subscriptions', [OwnerSubscriptionController::class, 'index']);
Route::post('/owner/subscriptions/subscribe', [OwnerSubscriptionController::class, 'subscribe']);
Route::post(
    '/owner/subscriptions/payment/order',
    [
        OwnerSubscriptionPaymentController::class,
        'createOrder',
    ]
);

Route::post(
    '/owner/subscriptions/payment/verify',
    [
        OwnerSubscriptionPaymentController::class,
        'verifyPayment',
    ]
);
});