<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\RestaurantSubscription;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerSubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found for this owner.',
            ], 422);
        }

        $restaurantId = $user->restaurant_id;

        /*
        |--------------------------------------------------------------------------
        | Mark already expired active subscriptions as expired
        |--------------------------------------------------------------------------
        */
        RestaurantSubscription::query()
            ->where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update([
                'status' => 'expired',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Active subscription plans
        |--------------------------------------------------------------------------
        */
        $plans = Subscription::query()
            ->where('is_active', true)
            ->orderBy('price')
            ->orderBy('id')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Current restaurant subscription
        |--------------------------------------------------------------------------
        */
        $currentSubscription = RestaurantSubscription::query()
            ->with('subscription')
            ->where('restaurant_id', $restaurantId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest('id')
            ->first();

        return response()->json([
            'success' => true,
            'plans' => $plans,
            'current_subscription' => $currentSubscription,
        ]);
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'subscription_id' => [
                'required',
                'integer',
                'exists:subscriptions,id',
            ],
        ]);

        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found for this owner.',
            ], 422);
        }

        $restaurantId = $user->restaurant_id;

        /*
        |--------------------------------------------------------------------------
        | Get selected active plan
        |--------------------------------------------------------------------------
        */
        $plan = Subscription::query()
            ->whereKey($validated['subscription_id'])
            ->where('is_active', true)
            ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Selected subscription plan is not available.',
            ], 422);
        }

// Paid plans require verified Razorpay payment

        if ((float) $plan->price > 0) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Payment is required before activating this subscription plan.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent duplicate subscription to same currently active plan
        |--------------------------------------------------------------------------
        */
        $existingSubscription = RestaurantSubscription::query()
            ->with('subscription')
            ->where('restaurant_id', $restaurantId)
            ->where('subscription_id', $plan->id)
            ->where('status', 'active')
            ->where(function ($query) {
                $query
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest('id')
            ->first();

        if ($existingSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'This subscription plan is already active.',
                'data' => $existingSubscription,
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Activate new subscription
        |--------------------------------------------------------------------------
        */
        $restaurantSubscription = DB::transaction(function () use (
            $restaurantId,
            $plan
        ) {
            /*
            | Expire old subscriptions if their date has already passed
            */
            RestaurantSubscription::query()
                ->where('restaurant_id', $restaurantId)
                ->where('status', 'active')
                ->whereNotNull('expires_at')
                ->where('expires_at', '<=', now())
                ->update([
                    'status' => 'expired',
                ]);

            /*
            | Cancel remaining currently active plan
            */
            RestaurantSubscription::query()
                ->where('restaurant_id', $restaurantId)
                ->where('status', 'active')
                ->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

            $startsAt = now();

            $intervalCount = max(
                1,
                (int) $plan->interval_count
            );

            if ($plan->interval === 'year') {
                $expiresAt = $startsAt
                    ->copy()
                    ->addYearsNoOverflow($intervalCount);
            } else {
                $expiresAt = $startsAt
                    ->copy()
                    ->addMonthsNoOverflow($intervalCount);
            }

            return RestaurantSubscription::create([
                'restaurant_id' => $restaurantId,
                'subscription_id' => $plan->id,
                'status' => 'active',
                'starts_at' => $startsAt,
                'expires_at' => $expiresAt,
                'cancelled_at' => null,
                'auto_renew' => false,
            ]);
        });

        $restaurantSubscription->load('subscription');

        return response()->json([
            'success' => true,
            'message' => 'Subscription activated successfully.',
            'data' => $restaurantSubscription,
        ], 201);
    }
}