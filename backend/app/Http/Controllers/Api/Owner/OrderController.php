<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Get all orders belonging to the logged-in owner's restaurant.
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
                'message' => 'Restaurant is not associated with this owner.',
            ], 422);
        }

        $orders = Order::with([
            'items',
            'customer',
        ])
            ->where('restaurant_id', $user->restaurant_id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

public function ownerOrders(Request $request)
{
    try {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $restaurant = $user->restaurant;

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $orders = Order::where(
            'restaurant_id',
            $restaurant->id
        )
        ->with([
            'items:id,order_id,menu_item_id,item_name,unit_price,quantity,total_price',
        ])
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);

    } catch (\Throwable $e) {

        return response()->json([
            'success' => false,
            'message' => 'Unable to load orders.',
            'error' => config('app.debug')
                ? $e->getMessage()
                : null,
        ], 500);
    }
}

    /**
     * Get a single order for the logged-in owner's restaurant.
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (
            !$user->restaurant_id ||
            (int) $order->restaurant_id !== (int) $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $order->load([
            'items',
            'customer',
            'restaurant',
        ]);

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    /**
     * Update order status.
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
            (int) $order->restaurant_id !== (int) $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:pending,preparing,ready,completed,cancelled',
            ],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        $order->load([
            'items',
            'customer',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }
}