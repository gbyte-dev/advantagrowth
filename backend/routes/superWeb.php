<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SupAdmin\RestaurantsController;
use App\Http\Controllers\Api\SupAdmin\SubscriptionController;

/*
|--------------------------------------------------------------------------
| SUPER ADMIN - RESTAURANTS
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'superadmin'])->prefix('superadmin')->group(function () {

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

        Route::patch('/{id}/toggle-status', [
            RestaurantsController::class,
            'toggleStatus'
        ]);

        Route::delete('/{id}', [
            RestaurantsController::class,
            'destroy'
        ]);
    });

    Route::prefix('subscription')->group(function(){
        Route::get('/',[SubscriptionController::class,'index']);
        Route::post('/',[SubscriptionController::class,'store']);
        Route::get('/{id}',[SubscriptionController::class,'show']);
        Route::put('/{id}',[SubscriptionController::class,'update']);
        Route::delete('/{id}',[SubscriptionController::class,'destroy']);
        Route::patch('/{id}/toggle-status', [SubscriptionController::class, 'toggleStatus']);

    });


});
