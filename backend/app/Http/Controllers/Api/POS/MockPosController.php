<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MockPosController extends Controller
{
    /**
     * Mock POS restaurant details.
     */
    public function restaurant(Request $request)
    {
        return response()->json([
            'id' => 'merchant_demo_001',

            'name' => 'Advanta Demo Restaurant',

            'legal_name' =>
                'Advanta Demo Restaurant Pvt Ltd',

            'phone' => '+91 9876543210',

            'email' =>
                'restaurant@example.com',

            'address' => [
                'line1' =>
                    '25 Restaurant Street',

                'line2' =>
                    'Business District',

                'city' => 'New Delhi',

                'postal_code' => '110001',

                'country' => 'India',
            ],

            'currency' => 'INR',

            'timezone' => 'Asia/Kolkata',
        ]);
    }

    /**
     * Mock POS restaurant locations.
     */
    public function locations(Request $request)
    {
        return response()->json([
            'locations' => [
                [
                    'id' =>
                        'location_demo_001',

                    'business_id' =>
                        'merchant_demo_001',

                    'name' =>
                        'Advanta Demo Restaurant - Main',

                    'legal_name' =>
                        'Advanta Demo Restaurant Pvt Ltd',

                    'phone' =>
                        '+91 9876543210',

                    'email' =>
                        'restaurant@example.com',

                    'address' => [
                        'line1' =>
                            '25 Restaurant Street',

                        'line2' =>
                            'Business District',

                        'city' =>
                            'New Delhi',

                        'postal_code' =>
                            '110001',

                        'country' =>
                            'India',
                    ],

                    'currency' => 'INR',

                    'timezone' =>
                        'Asia/Kolkata',
                ],

                [
                    'id' =>
                        'location_demo_002',

                    'business_id' =>
                        'merchant_demo_001',

                    'name' =>
                        'Advanta Demo Restaurant - Branch',

                    'phone' =>
                        '+91 9876543211',

                    'email' =>
                        'branch@example.com',

                    'address' => [
                        'line1' =>
                            '80 Market Road',

                        'city' =>
                            'Gurugram',

                        'postal_code' =>
                            '122001',

                        'country' =>
                            'India',
                    ],

                    'currency' => 'INR',

                    'timezone' =>
                        'Asia/Kolkata',
                ],
            ],
        ]);
    }

    /**
 * Mock POS orders for development testing.
 */
public function orders(
    \Illuminate\Http\Request $request
) {
    /*
    |--------------------------------------------------------------------------
    | Requested incremental sync window
    |--------------------------------------------------------------------------
    */

    $start = $request->query('start');
    $end = $request->query('end');

    try {
        $startDate = $start
            ? \Carbon\Carbon::parse($start)
            : now()->subDays(7);

        $endDate = $end
            ? \Carbon\Carbon::parse($end)
            : now();
    } catch (\Throwable $exception) {
        return response()->json([
            'success' => false,
            'message' =>
                'Invalid start or end date.',
        ], 422);
    }

    /*
    |--------------------------------------------------------------------------
    | Mock timestamps
    |--------------------------------------------------------------------------
    |
    | ORDER 1001:
    | Old unchanged order.
    |
    | ORDER 1002:
    | Existing order updated recently.
    |
    | ORDER 1003:
    | Brand new recent order.
    |
    */

    $oldOrderCreated =
        now()->subHours(2);

    $oldOrderUpdated =
        now()->subMinutes(30);

    $updatedOrderCreated =
        now()->subHour();

    $updatedOrderUpdated =
        now()->subMinutes(2);

    $newOrderCreated =
        now()->subMinute();

    $newOrderUpdated =
        now()->subMinute();

    $orders = [
        /*
        |--------------------------------------------------------------------------
        | MOCK ORDER 1001
        | OLD / UNCHANGED
        |--------------------------------------------------------------------------
        */

        [
            'external_order_id' =>
                'MOCK-ORDER-1001',

            'external_location_id' =>
                'mock-location-1',

            'source' =>
                'custom_api',

            'order_type' =>
                'dine_in',

            'table_number' =>
                'T-04',

            'customer_name' =>
                'Rahul Sharma',

            'customer_phone' =>
                '9876543210',

            'customer_email' =>
                'rahul@example.com',

            'delivery_address' =>
                null,

            'subtotal' =>
                28.00,

            'tax_amount' =>
                2.80,

            'delivery_charge' =>
                0,

            'tip_amount' =>
                3.00,

            'total' =>
                33.80,

            'status' =>
                'completed',

            'payment_status' =>
                'paid',

            'payment_id' =>
                'PAY-MOCK-1001',

            'payment_method' =>
                'card',

            'special_instructions' =>
                'Less spicy',

            'pos_created_at' =>
                $oldOrderCreated
                    ->toIso8601String(),

            'pos_updated_at' =>
                $oldOrderUpdated
                    ->toIso8601String(),

            'items' => [
                [
                    'external_item_id' =>
                        'ITEM-1001-A',

                    'external_menu_item_id' =>
                        'MENU-101',

                    'item_name' =>
                        'Chicken Tikka Masala',

                    'unit_price' =>
                        14.00,

                    'quantity' =>
                        1,

                    'total_price' =>
                        14.00,

                    'modifiers' => [
                        [
                            'name' =>
                                'Extra Spicy',

                            'quantity' =>
                                1,

                            'price' =>
                                0,
                        ],
                    ],

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],

                [
                    'external_item_id' =>
                        'ITEM-1001-B',

                    'external_menu_item_id' =>
                        'MENU-102',

                    'item_name' =>
                        'Chicken Biryani',

                    'unit_price' =>
                        14.00,

                    'quantity' =>
                        1,

                    'total_price' =>
                        14.00,

                    'modifiers' =>
                        [],

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],
            ],

            'payments' => [
                [
                    'external_payment_id' =>
                        'PAY-MOCK-1001',

                    'type' =>
                        'card',

                    'amount' =>
                        33.80,

                    'tip_amount' =>
                        3.00,

                    'card_type' =>
                        'VISA',

                    'paid_at' =>
                        $oldOrderUpdated
                            ->toIso8601String(),

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],
            ],

            'raw_data' => [
                'mock_provider' =>
                    'Advanta Mock POS',

                'order_number' =>
                    '1001',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | MOCK ORDER 1002
        | EXISTING BUT RECENTLY UPDATED
        |--------------------------------------------------------------------------
        */

        [
            'external_order_id' =>
                'MOCK-ORDER-1002',

            'external_location_id' =>
                'mock-location-1',

            'source' =>
                'custom_api',

            'order_type' =>
                'takeaway',

            'table_number' =>
                null,

            'customer_name' =>
                'Priya Kapoor',

            'customer_phone' =>
                '9999999999',

            'customer_email' =>
                null,

            'delivery_address' =>
                null,

            /*
             * Slightly changed amount so we can prove
             * the existing DB row was updated.
             */

            'subtotal' =>
                16.00,

            'tax_amount' =>
                1.60,

            'delivery_charge' =>
                0,

            'tip_amount' =>
                0,

            'total' =>
                17.60,

            'status' =>
                'completed',

            'payment_status' =>
                'paid',

            'payment_id' =>
                'PAY-MOCK-1002',

            'payment_method' =>
                'cash',

            'special_instructions' =>
                null,

            'pos_created_at' =>
                $updatedOrderCreated
                    ->toIso8601String(),

            'pos_updated_at' =>
                $updatedOrderUpdated
                    ->toIso8601String(),

            'items' => [
                [
                    'external_item_id' =>
                        'ITEM-1002-A',

                    'external_menu_item_id' =>
                        'MENU-103',

                    'item_name' =>
                        'Tofu Pasta',

                    'unit_price' =>
                        16.00,

                    'quantity' =>
                        1,

                    'total_price' =>
                        16.00,

                    'modifiers' =>
                        [],

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],
            ],

            'payments' => [
                [
                    'external_payment_id' =>
                        'PAY-MOCK-1002',

                    'type' =>
                        'cash',

                    'amount' =>
                        17.60,

                    'tip_amount' =>
                        0,

                    'paid_at' =>
                        $updatedOrderUpdated
                            ->toIso8601String(),

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],
            ],

            'raw_data' => [
                'mock_provider' =>
                    'Advanta Mock POS',

                'order_number' =>
                    '1002',

                'mock_change' =>
                    'Order updated during incremental sync test',
            ],
        ],

        /*
        |--------------------------------------------------------------------------
        | MOCK ORDER 1003
        | NEW ORDER
        |--------------------------------------------------------------------------
        */

        [
            'external_order_id' =>
                'MOCK-ORDER-1003',

            'external_location_id' =>
                'mock-location-2',

            'source' =>
                'custom_api',

            'order_type' =>
                'dine_in',

            'table_number' =>
                'T-08',

            'customer_name' =>
                'Aman Verma',

            'customer_phone' =>
                '8888888888',

            'customer_email' =>
                'aman@example.com',

            'delivery_address' =>
                null,

            'subtotal' =>
                22.00,

            'tax_amount' =>
                2.20,

            'delivery_charge' =>
                0,

            'tip_amount' =>
                2.00,

            'total' =>
                26.20,

            'status' =>
                'preparing',

            'payment_status' =>
                'paid',

            'payment_id' =>
                'PAY-MOCK-1003',

            'payment_method' =>
                'card',

            'special_instructions' =>
                'No onion',

            'pos_created_at' =>
                $newOrderCreated
                    ->toIso8601String(),

            'pos_updated_at' =>
                $newOrderUpdated
                    ->toIso8601String(),

            'items' => [
                [
                    'external_item_id' =>
                        'ITEM-1003-A',

                    'external_menu_item_id' =>
                        'MENU-104',

                    'item_name' =>
                        'Paneer Tikka',

                    'unit_price' =>
                        12.00,

                    'quantity' =>
                        1,

                    'total_price' =>
                        12.00,

                    'modifiers' =>
                        [],

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],

                [
                    'external_item_id' =>
                        'ITEM-1003-B',

                    'external_menu_item_id' =>
                        'MENU-105',

                    'item_name' =>
                        'Garlic Naan',

                    'unit_price' =>
                        5.00,

                    'quantity' =>
                        2,

                    'total_price' =>
                        10.00,

                    'modifiers' =>
                        [],

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],
            ],

            'payments' => [
                [
                    'external_payment_id' =>
                        'PAY-MOCK-1003',

                    'type' =>
                        'card',

                    'amount' =>
                        26.20,

                    'tip_amount' =>
                        2.00,

                    'card_type' =>
                        'MASTERCARD',

                    'paid_at' =>
                        $newOrderUpdated
                            ->toIso8601String(),

                    'raw_data' => [
                        'mock' =>
                            true,
                    ],
                ],
            ],

            'raw_data' => [
                'mock_provider' =>
                    'Advanta Mock POS',

                'order_number' =>
                    '1003',

                'mock_change' =>
                    'New order during incremental sync test',
            ],
        ],
    ];

    /*
    |--------------------------------------------------------------------------
    | Incremental filtering
    |--------------------------------------------------------------------------
    |
    | Only return orders whose POS updated timestamp falls inside
    | the requested sync window.
    |
    */

    $filteredOrders =
        array_values(
            array_filter(
                $orders,
                function (
                    array $order
                ) use (
                    $startDate,
                    $endDate
                ) {
                    $updatedAt =
                        $order[
                            'pos_updated_at'
                        ] ?? null;

                    if (!$updatedAt) {
                        return false;
                    }

                    try {
                        $updated =
                            \Carbon\Carbon::parse(
                                $updatedAt
                            );
                    } catch (
                        \Throwable
                    ) {
                        return false;
                    }

                    return (
                        $updated
                            ->greaterThanOrEqualTo(
                                $startDate
                            )
                        &&
                        $updated
                            ->lessThanOrEqualTo(
                                $endDate
                            )
                    );
                }
            )
        );

    return response()->json([
        'success' =>
            true,

        'sync_window' => [
            'start' =>
                $startDate
                    ->toIso8601String(),

            'end' =>
                $endDate
                    ->toIso8601String(),
        ],

        'total_mock_orders' =>
            count($orders),

        'returned_orders' =>
            count(
                $filteredOrders
            ),

        'orders' =>
            $filteredOrders,
    ]);
}
}
