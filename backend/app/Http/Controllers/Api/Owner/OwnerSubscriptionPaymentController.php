<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\RestaurantSubscription;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Services\Subscription\RazorpaySubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Razorpay\Api\Errors\SignatureVerificationError;
use Throwable;

class OwnerSubscriptionPaymentController extends Controller
{
    public function createOrder(
        Request $request,
        RazorpaySubscriptionService $razorpay
    ) {
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
                'message' =>
                    'Restaurant not found for this owner.',
            ], 422);
        }

        $plan = Subscription::query()
            ->whereKey(
                $validated['subscription_id']
            )
            ->where('is_active', true)
            ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Selected subscription plan is not available.',
            ], 422);
        }

        $amountMinor = (int) round(
            ((float) $plan->price) * 100
        );

        if ($amountMinor < 1) {
            return response()->json([
                'success' => false,
                'message' =>
                    'This plan cannot be purchased through Razorpay because its price is zero.',
            ], 422);
        }

        $receipt = sprintf(
            'sub_%d_%s',
            $user->restaurant_id,
            Str::lower(
                Str::random(24)
            )
        );

        try {
            $razorpayOrder =
                $razorpay->createOrder(
                    receipt: $receipt,
                    amountMinor: $amountMinor,
                    currency: $plan->currency,
                    notes: [
                        'restaurant_id' =>
                            (string) $user->restaurant_id,

                        'subscription_id' =>
                            (string) $plan->id,

                        'subscription_name' =>
                            $plan->name,
                    ]
                );

            $payment =
                SubscriptionPayment::create([
                    'restaurant_id' =>
                        $user->restaurant_id,

                    'subscription_id' =>
                        $plan->id,

                    'provider' =>
                        'razorpay',

                    'receipt' =>
                        $receipt,

                    'provider_order_id' =>
                        $razorpayOrder['id'],

                    'amount_minor' =>
                        $amountMinor,

                    'amount' =>
                        $plan->price,

                    'currency' =>
                        strtoupper(
                            $plan->currency
                        ),

                    'status' =>
                        SubscriptionPayment::STATUS_PENDING,

                    'provider_payload' => [
                        'order_id' =>
                            $razorpayOrder['id'],

                        'order_status' =>
                            $razorpayOrder['status']
                            ?? 'created',

                        'created_at' =>
                            $razorpayOrder['created_at']
                            ?? null,
                    ],
                ]);

            return response()->json([
                'success' => true,
                'message' =>
                    'Razorpay order created successfully.',

                'data' => [
                    'payment_record_id' =>
                        $payment->id,

                    'key' =>
                        $razorpay->publicKey(),

                    'order_id' =>
                        $payment->provider_order_id,

                    'amount' =>
                        $payment->amount_minor,

                    'currency' =>
                        $payment->currency,

                    'plan' => [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'price' => $plan->price,
                        'currency' =>
                            $plan->currency,
                        'interval' =>
                            $plan->interval,
                        'interval_count' =>
                            $plan->interval_count,
                    ],

                    'prefill' => [
                        'name' =>
                            $user->owner_name,

                        'email' =>
                            $user->email,

                        'contact' =>
                            $user->phone,
                    ],
                ],
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' =>
                    'Unable to create Razorpay order. Please try again.',
            ], 502);
        }
    }

    public function verifyPayment(
        Request $request,
        RazorpaySubscriptionService $razorpay
    ) {
        $validated = $request->validate([
            'razorpay_order_id' => [
                'required',
                'string',
                'max:191',
            ],
            'razorpay_payment_id' => [
                'required',
                'string',
                'max:191',
            ],
            'razorpay_signature' => [
                'required',
                'string',
                'max:500',
            ],
        ]);

        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant not found for this owner.',
            ], 422);
        }

        $payment =
            SubscriptionPayment::query()
                ->with('subscription')
                ->where(
                    'restaurant_id',
                    $user->restaurant_id
                )
                ->where(
                    'provider_order_id',
                    $validated[
                        'razorpay_order_id'
                    ]
                )
                ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Subscription payment order not found.',
            ], 404);
        }

        if (
            $payment->status ===
            SubscriptionPayment::STATUS_PAID
        ) {
            $payment->load(
                'restaurantSubscription.subscription'
            );

            return response()->json([
                'success' => true,
                'message' =>
                    'Payment was already verified.',

                'data' => [
                    'payment' => $payment,
                    'subscription' =>
                        $payment
                            ->restaurantSubscription,
                ],
            ]);
        }

        try {
            $razorpay->verifyPaymentSignature(
                orderId:
                    $validated[
                        'razorpay_order_id'
                    ],

                paymentId:
                    $validated[
                        'razorpay_payment_id'
                    ],

                signature:
                    $validated[
                        'razorpay_signature'
                    ]
            );
        } catch (
            SignatureVerificationError $exception
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Razorpay payment signature verification failed.',
            ], 422);
        }

        try {
            $providerPayment =
                $razorpay->fetchPayment(
                    $validated[
                        'razorpay_payment_id'
                    ]
                );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' =>
                    'Unable to verify payment with Razorpay.',
            ], 502);
        }

        if (
            ($providerPayment['order_id'] ?? null)
                !== $payment->provider_order_id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Razorpay payment does not belong to this order.',
            ], 422);
        }

        if (
            (int) (
                $providerPayment['amount']
                ?? 0
            ) !== $payment->amount_minor
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Razorpay payment amount does not match the subscription order.',
            ], 422);
        }

        if (
            strtoupper(
                (string) (
                    $providerPayment['currency']
                    ?? ''
                )
            ) !== strtoupper(
                $payment->currency
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Razorpay payment currency does not match the subscription order.',
            ], 422);
        }

        if (
            ($providerPayment['status'] ?? null)
                !== 'captured'
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Payment has not been captured by Razorpay.',
            ], 422);
        }

        $restaurantSubscription =
            DB::transaction(
                function () use (
                    $payment,
                    $providerPayment,
                    $validated
                ) {
                    $lockedPayment =
                        SubscriptionPayment::query()
                            ->whereKey(
                                $payment->id
                            )
                            ->lockForUpdate()
                            ->firstOrFail();

                    if (
                        $lockedPayment->status ===
                        SubscriptionPayment::STATUS_PAID
                    ) {
                        return
                            $lockedPayment
                                ->restaurantSubscription;
                    }

                    $now = now();

                    RestaurantSubscription::query()
                        ->where(
                            'restaurant_id',
                            $lockedPayment
                                ->restaurant_id
                        )
                        ->where(
                            'status',
                            'active'
                        )
                        ->whereNotNull(
                            'expires_at'
                        )
                        ->where(
                            'expires_at',
                            '<=',
                            $now
                        )
                        ->update([
                            'status' =>
                                'expired',
                        ]);

                    $currentSubscription =
                        RestaurantSubscription::query()
                            ->where(
                                'restaurant_id',
                                $lockedPayment
                                    ->restaurant_id
                            )
                            ->where(
                                'status',
                                'active'
                            )
                            ->where(function (
                                $query
                            ) use ($now) {
                                $query
                                    ->whereNull(
                                        'expires_at'
                                    )
                                    ->orWhere(
                                        'expires_at',
                                        '>',
                                        $now
                                    );
                            })
                            ->latest('id')
                            ->lockForUpdate()
                            ->first();

                    $plan =
                        Subscription::findOrFail(
                            $lockedPayment
                                ->subscription_id
                        );

                    if (
                        $currentSubscription &&
                        $currentSubscription
                            ->subscription_id ===
                            $plan->id
                    ) {
                        $expiryBase =
                            $currentSubscription
                                ->expires_at &&
                            $currentSubscription
                                ->expires_at
                                ->isFuture()
                                ? $currentSubscription
                                    ->expires_at
                                    ->copy()
                                : $now->copy();

                        $currentSubscription
                            ->update([
                                'expires_at' =>
                                    $this
                                        ->calculateExpiry(
                                            $expiryBase,
                                            $plan
                                        ),

                                'cancelled_at' =>
                                    null,
                            ]);

                        $restaurantSubscription =
                            $currentSubscription
                                ->fresh();
                    } else {
                        RestaurantSubscription::query()
                            ->where(
                                'restaurant_id',
                                $lockedPayment
                                    ->restaurant_id
                            )
                            ->where(
                                'status',
                                'active'
                            )
                            ->update([
                                'status' =>
                                    'cancelled',

                                'cancelled_at' =>
                                    $now,
                            ]);

                        $restaurantSubscription =
                            RestaurantSubscription::create([
                                'restaurant_id' =>
                                    $lockedPayment
                                        ->restaurant_id,

                                'subscription_id' =>
                                    $plan->id,

                                'status' =>
                                    'active',

                                'starts_at' =>
                                    $now,

                                'expires_at' =>
                                    $this
                                        ->calculateExpiry(
                                            $now->copy(),
                                            $plan
                                        ),

                                'cancelled_at' =>
                                    null,

                                'auto_renew' =>
                                    false,
                            ]);
                    }

                    $lockedPayment->update([
                        'restaurant_subscription_id' =>
                            $restaurantSubscription
                                ->id,

                        'provider_payment_id' =>
                            $validated[
                                'razorpay_payment_id'
                            ],

                        'status' =>
                            SubscriptionPayment::STATUS_PAID,

                        'payment_method' =>
                            $providerPayment[
                                'method'
                            ] ?? null,

                        'verified_at' =>
                            $now,

                        'paid_at' =>
                            isset(
                                $providerPayment[
                                    'created_at'
                                ]
                            )
                                ? Carbon::createFromTimestamp(
                                    (int) $providerPayment[
                                        'created_at'
                                    ]
                                )
                                : $now,

                        'failed_at' =>
                            null,

                        'failure_reason' =>
                            null,

                        'provider_payload' => [
                            'payment_id' =>
                                $providerPayment['id']
                                ?? null,

                            'order_id' =>
                                $providerPayment['order_id']
                                ?? null,

                            'status' =>
                                $providerPayment['status']
                                ?? null,

                            'method' =>
                                $providerPayment['method']
                                ?? null,

                            'captured' =>
                                $providerPayment['captured']
                                ?? null,

                            'email' =>
                                $providerPayment['email']
                                ?? null,

                            'contact' =>
                                $providerPayment['contact']
                                ?? null,
                        ],
                    ]);

                    return
                        $restaurantSubscription;
                }
            );

        $restaurantSubscription->load(
            'subscription'
        );

        return response()->json([
            'success' => true,
            'message' =>
                'Payment verified and subscription activated successfully.',

            'data' => [
                'payment' =>
                    $payment->fresh(),

                'subscription' =>
                    $restaurantSubscription,
            ],
        ]);
    }

    private function calculateExpiry(
        Carbon $from,
        Subscription $plan
    ): Carbon {
        $intervalCount = max(
            1,
            (int) $plan->interval_count
        );

        if ($plan->interval === 'year') {
            return $from
                ->addYearsNoOverflow(
                    $intervalCount
                );
        }

        return $from
            ->addMonthsNoOverflow(
                $intervalCount
            );
    }
}