<?php

namespace App\Http\Middleware;

use App\Models\RestaurantSubscription;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSubscription
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Routes available without an active subscription
        |--------------------------------------------------------------------------
        */

        if (
            $request->is('api/owner/weather') ||
            $request->is('api/owner/subscriptions') ||
            $request->is('api/owner/subscriptions/*') ||
            $request->is('api/restaurant/profile') ||
            $request->is('api/auth/account')
        ) {
            return $next($request);
        }

        if (!$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found for this owner.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Mark finished subscriptions as expired
        |--------------------------------------------------------------------------
        */

        RestaurantSubscription::query()
            ->where(
                'restaurant_id',
                $user->restaurant_id
            )
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update([
                'status' => 'expired',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Check current valid subscription
        |--------------------------------------------------------------------------
        */

        $hasActiveSubscription =
            RestaurantSubscription::query()
                ->where(
                    'restaurant_id',
                    $user->restaurant_id
                )
                ->where('status', 'active')
                ->where(function ($query) {
                    $query
                        ->whereNull('starts_at')
                        ->orWhere(
                            'starts_at',
                            '<=',
                            now()
                        );
                })
                ->where(function ($query) {
                    $query
                        ->whereNull('expires_at')
                        ->orWhere(
                            'expires_at',
                            '>',
                            now()
                        );
                })
                ->exists();

        if (!$hasActiveSubscription) {
            return response()->json([
                'success' => false,
                'code' => 'SUBSCRIPTION_REQUIRED',
                'message' => 'An active subscription is required to access this feature.',
            ], 403);
        }

        return $next($request);
    }
}