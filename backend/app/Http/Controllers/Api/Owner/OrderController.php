<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * List all restaurant orders.
     *
     * Supports:
     * - website orders
     * - Toast orders
     * - Restolution orders
     * - Custom API development orders
     * - search
     * - status
     * - payment status
     * - source
     * - order type
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant is not associated with this owner.',
            ], 422);
        }

        $query = Order::query()
            ->where(
                'restaurant_id',
                $user->restaurant_id
            )
            ->with([
                'items',
                'posConnection:id,provider,label,status,external_merchant_id',
                'posPayments',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->query(
                'search',
                ''
            )
        );

        if ($search !== '') {
            $query->where(
                function (
                    Builder $builder
                ) use ($search) {
                    $builder
                        ->where(
                            'customer_name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'customer_phone',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'customer_email',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'external_order_id',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'payment_id',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'table_number',
                            'like',
                            "%{$search}%"
                        );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Order Status
        |--------------------------------------------------------------------------
        */

        $status =
            $request->query('status');

        if (
            is_string($status) &&
            $status !== '' &&
            $status !== 'all'
        ) {
            $query->where(
                'status',
                $status
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Payment Status
        |--------------------------------------------------------------------------
        */

        $paymentStatus =
            $request->query(
                'payment_status'
            );

        if (
            is_string($paymentStatus) &&
            $paymentStatus !== '' &&
            $paymentStatus !== 'all'
        ) {
            $query->where(
                'payment_status',
                $paymentStatus
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Source
        |--------------------------------------------------------------------------
        |
        | Examples:
        | website
        | toast
        | restolution
        | custom_api
        |
        */

        $source =
            $request->query('source');

        if (
            is_string($source) &&
            $source !== '' &&
            $source !== 'all'
        ) {
            $query->where(
                'source',
                $source
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Order Type
        |--------------------------------------------------------------------------
        */

        $orderType =
            $request->query(
                'order_type'
            );

        if (
            is_string($orderType) &&
            $orderType !== '' &&
            $orderType !== 'all'
        ) {
            $query->where(
                'order_type',
                $orderType
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        |
        | Prefer POS creation date when available.
        |
        */

        $query
            ->orderByRaw(
                'COALESCE(pos_created_at, created_at) DESC'
            )
            ->orderByDesc('id');

        $orders =
            $query->get();

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summary = [
            'total_orders' =>
                $orders->count(),

            'pending' =>
                $orders
                    ->where(
                        'status',
                        'pending'
                    )
                    ->count(),

            'preparing' =>
                $orders
                    ->where(
                        'status',
                        'preparing'
                    )
                    ->count(),

            'ready' =>
                $orders
                    ->where(
                        'status',
                        'ready'
                    )
                    ->count(),

            'completed' =>
                $orders
                    ->where(
                        'status',
                        'completed'
                    )
                    ->count(),

            'cancelled' =>
                $orders
                    ->where(
                        'status',
                        'cancelled'
                    )
                    ->count(),

            'paid' =>
                $orders
                    ->where(
                        'payment_status',
                        'paid'
                    )
                    ->count(),

            'pos_orders' =>
                $orders
                    ->whereNotNull(
                        'pos_connection_id'
                    )
                    ->count(),

            'website_orders' =>
                $orders
                    ->whereNull(
                        'pos_connection_id'
                    )
                    ->count(),

            'total_sales' =>
                round(
                    (float)
                    $orders
                        ->where(
                            'payment_status',
                            'paid'
                        )
                        ->sum('total'),
                    2
                ),
        ];

        return response()->json([
            'success' => true,

            'summary' =>
                $summary,

            'orders' =>
                $orders,
        ]);
    }

    /**
     * Get one order belonging to
     * logged-in owner's restaurant.
     */
    public function show(
        Request $request,
        Order $order
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (
            !$user->restaurant_id ||
            (int) $order->restaurant_id !==
                (int) $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $order->load([
            'items',

            'posConnection:id,provider,label,status,external_merchant_id,last_synced_at',

            'posPayments',

            'restaurant:id,name,email,phone,currency,timezone',
        ]);

        return response()->json([
            'success' => true,

            'order' =>
                $order,
        ]);
    }

    /**
     * Update a non-POS order status.
     *
     * POS order status should stay controlled
     * by the connected POS and synchronization.
     */
    public function updateStatus(
        Request $request,
        Order $order
    ) {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (
            !$user->restaurant_id ||
            (int) $order->restaurant_id !==
                (int) $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | POS orders
        |--------------------------------------------------------------------------
        |
        | Avoid local status changes that would be overwritten
        | by the next Toast/Restolution synchronization.
        |
        */

        if ($order->pos_connection_id) {
            return response()->json([
                'success' => false,

                'message' =>
                    'This order is managed by the connected POS system. Its status will update automatically during POS synchronization.',
            ], 422);
        }

        $validated =
            $request->validate([
                'status' => [
                    'required',
                    'string',
                    'in:pending,preparing,ready,completed,cancelled',
                ],
            ]);

        $order->update([
            'status' =>
                $validated['status'],
        ]);

        $order->load([
            'items',
        ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Order status updated successfully.',

            'order' =>
                $order,
        ]);
    }
}