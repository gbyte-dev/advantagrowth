<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Razorpay\Api\Api;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => ['required', 'integer', 'exists:restaurants,id'],

            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_email' => ['required', 'email', 'max:255'],

            'items' => ['required', 'array', 'min:1'],

            'items.*.menu_item_id' => [
                'required',
                'integer',
                'exists:menu_items,id',
            ],

            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'special_requests' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        try {
            $order = DB::transaction(function () use ($validated, $request) {

                $customerId = null;

                if ($request->user()) {
                    $customer = Customer::where(
                        'user_id',
                        $request->user()->id
                    )->first();

                    if ($customer) {
                        $customerId = $customer->id;
                    }
                }

                $menuItemIds = collect($validated['items'])
                    ->pluck('menu_item_id')
                    ->unique()
                    ->values();

                $menuItems = MenuItem::whereIn('id', $menuItemIds)
                    ->where('restaurant_id', $validated['restaurant_id'])
                    ->get()
                    ->keyBy('id');

                if ($menuItems->count() !== $menuItemIds->count()) {
                    abort(
                        422,
                        'One or more menu items do not belong to this restaurant.'
                    );
                }

                $subtotal = 0;

                foreach ($validated['items'] as $cartItem) {
                    $menuItem = $menuItems->get(
                        $cartItem['menu_item_id']
                    );

                    if (!$menuItem->is_available) {
                        abort(
                            422,
                            "{$menuItem->name} is currently unavailable."
                        );
                    }

                    $subtotal +=
                        (float) $menuItem->price *
                        (int) $cartItem['quantity'];
                }

                $deliveryCharge = 0;
                $total = $subtotal + $deliveryCharge;

                $orderNumber =
                    'ORD-' .
                    now()->format('YmdHis') .
                    '-' .
                    strtoupper(Str::random(5));

                $order = Order::create([
                    'restaurant_id' => $validated['restaurant_id'],
                    'customer_id' => $customerId,

                    'order_number' => $orderNumber,

                    'customer_name' => $validated['customer_name'],
                    'customer_phone' => $validated['customer_phone'],
                    'customer_email' => $validated['customer_email'],

                    'subtotal' => $subtotal,
                    'delivery_charge' => $deliveryCharge,
                    'total' => $total,

                    'status' => 'pending',
                    'payment_status' => 'pending',

                    'special_instructions' =>
                        $validated['special_requests'] ?? null,
                ]);

                foreach ($validated['items'] as $cartItem) {
                    $menuItem = $menuItems->get(
                        $cartItem['menu_item_id']
                    );

                    $quantity = (int) $cartItem['quantity'];
                    $price = (float) $menuItem->price;

                    $order->items()->create([
                        'menu_item_id' => $menuItem->id,
                        'item_name' => $menuItem->name,
                        'unit_price' => $price,
                        'quantity' => $quantity,
                        'total_price' => $price * $quantity,
                    ]);
                }

                return $order->load('items');
            });

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'order' => $order,
            ], 201);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Unable to create order.',
                'error' => config('app.debug')
                    ? $e->getMessage()
                    : null,
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE RAZORPAY ORDER
    |--------------------------------------------------------------------------
    */

    public function createPayment(Order $order)
    {
        try {
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'This order has already been paid.',
                ], 422);
            }

            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $razorpayOrder = $api->order->create([
                'receipt' => $order->order_number,
                'amount' => (int) round(
                    (float) $order->total * 100
                ),
                'currency' => 'INR',
            ]);

            $order->update([
                'payment_id' => $razorpayOrder['id'],
            ]);

            return response()->json([
                'success' => true,

                'message' => 'Payment order created.',

                'payment' => [
                    'razorpay_order_id' =>
                        $razorpayOrder['id'],

                    'amount' =>
                        (int) round(
                            (float) $order->total * 100
                        ),

                    'currency' => 'INR',

                    'key' =>
                        config('services.razorpay.key'),

                    'order_id' =>
                        $order->id,

                    'customer' => [
                        'name' =>
                            $order->customer_name,

                        'email' =>
                            $order->customer_email,

                        'phone' =>
                            $order->customer_phone,
                    ],
                ],
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Unable to create payment order.',

                'error' => config('app.debug')
                    ? $e->getMessage()
                    : null,
            ], 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | VERIFY RAZORPAY PAYMENT
    |--------------------------------------------------------------------------
    */

    public function verifyPayment(
        Request $request,
        Order $order
    ) {
        $validated = $request->validate([
            'razorpay_order_id' => [
                'required',
                'string',
            ],

            'razorpay_payment_id' => [
                'required',
                'string',
            ],

            'razorpay_signature' => [
                'required',
                'string',
            ],
        ]);

        try {
            if (
                $order->payment_id !==
                $validated['razorpay_order_id']
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Payment order does not match.',
                ], 422);
            }

            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $api->utility->verifyPaymentSignature([
                'razorpay_order_id' =>
                    $validated['razorpay_order_id'],

                'razorpay_payment_id' =>
                    $validated['razorpay_payment_id'],

                'razorpay_signature' =>
                    $validated['razorpay_signature'],
            ]);

            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);

            return response()->json([
                'success' => true,

                'message' =>
                    'Payment verified successfully.',

                'order' =>
                    $order->fresh()->load('items'),
            ]);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Payment verification failed.',

                'error' => config('app.debug')
                    ? $e->getMessage()
                    : null,
            ], 422);
        }
    }


    public function show(Order $order)
    {
        $order->load([
            'items',
            'restaurant',
            'customer',
        ]);

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }
}