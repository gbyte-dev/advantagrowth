<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionPaymentController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => [
                'nullable',
                Rule::in([
                    SubscriptionPayment::STATUS_PENDING,
                    SubscriptionPayment::STATUS_PAID,
                    SubscriptionPayment::STATUS_FAILED,
                    SubscriptionPayment::STATUS_REFUNDED,
                ]),
            ],
            'search' => [
                'nullable',
                'string',
                'max:255',
            ],
            'date_from' => [
                'nullable',
                'date',
            ],
            'date_to' => [
                'nullable',
                'date',
                'after_or_equal:date_from',
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $query =
            SubscriptionPayment::query()
                ->with([
                    'restaurant:id,name,email',
                    'subscription:id,name,slug',
                    'restaurantSubscription:id,subscription_id,status,starts_at,expires_at',
                ])
                ->latest('id');

        if (!empty($validated['status'])) {
            $query->where(
                'status',
                $validated['status']
            );
        }

        if (!empty($validated['search'])) {
            $search =
                $validated['search'];

            $query->where(
                function ($builder) use (
                    $search
                ) {
                    $builder
                        ->where(
                            'provider_order_id',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'provider_payment_id',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhereHas(
                            'restaurant',
                            function (
                                $restaurantQuery
                            ) use ($search) {
                                $restaurantQuery
                                    ->where(
                                        'name',
                                        'like',
                                        "%{$search}%"
                                    )
                                    ->orWhere(
                                        'email',
                                        'like',
                                        "%{$search}%"
                                    );
                            }
                        )
                        ->orWhereHas(
                            'subscription',
                            function (
                                $subscriptionQuery
                            ) use ($search) {
                                $subscriptionQuery
                                    ->where(
                                        'name',
                                        'like',
                                        "%{$search}%"
                                    );
                            }
                        );
                }
            );
        }

        if (!empty($validated['date_from'])) {
            $query->whereDate(
                'created_at',
                '>=',
                $validated['date_from']
            );
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate(
                'created_at',
                '<=',
                $validated['date_to']
            );
        }

        $payments = $query->paginate(
            $validated['per_page'] ?? 20
        );

        $statusCounts =
            SubscriptionPayment::query()
                ->selectRaw(
                    'status, COUNT(*) as total'
                )
                ->groupBy('status')
                ->pluck('total', 'status');

        $paidTotals =
            SubscriptionPayment::query()
                ->where(
                    'status',
                    SubscriptionPayment::STATUS_PAID
                )
                ->selectRaw(
                    'currency, COUNT(*) as payments_count, SUM(amount) as total_amount'
                )
                ->groupBy('currency')
                ->orderBy('currency')
                ->get();

        return response()->json([
            'success' => true,
            'message' =>
                'Subscription payments fetched successfully.',
            'data' => $payments,
            'summary' => [
                'status_counts' => [
                    'pending' => (int) (
                        $statusCounts[
                            SubscriptionPayment::STATUS_PENDING
                        ] ?? 0
                    ),
                    'paid' => (int) (
                        $statusCounts[
                            SubscriptionPayment::STATUS_PAID
                        ] ?? 0
                    ),
                    'failed' => (int) (
                        $statusCounts[
                            SubscriptionPayment::STATUS_FAILED
                        ] ?? 0
                    ),
                    'refunded' => (int) (
                        $statusCounts[
                            SubscriptionPayment::STATUS_REFUNDED
                        ] ?? 0
                    ),
                ],
                'paid_totals_by_currency' =>
                    $paidTotals,
            ],
        ]);
    }

    public function show(string $id)
    {
        $payment =
            SubscriptionPayment::query()
                ->with([
                    'restaurant',
                    'subscription',
                    'restaurantSubscription.subscription',
                ])
                ->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Subscription payment not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' =>
                'Subscription payment fetched successfully.',
            'data' => $payment,
        ]);
    }
}