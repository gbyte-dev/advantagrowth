<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
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

            'name' =>
                'Advanta Demo Restaurant',

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

            'currency' =>
                'INR',

            'timezone' =>
                'Asia/Kolkata',
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

                    'currency' =>
                        'INR',

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

                    'legal_name' =>
                        'Advanta Demo Restaurant Pvt Ltd',

                    'phone' =>
                        '+91 9876543211',

                    'email' =>
                        'branch@example.com',

                    'address' => [
                        'line1' =>
                            '80 Market Road',

                        'line2' =>
                            null,

                        'city' =>
                            'Gurugram',

                        'postal_code' =>
                            '122001',

                        'country' =>
                            'India',
                    ],

                    'currency' =>
                        'INR',

                    'timezone' =>
                        'Asia/Kolkata',
                ],
            ],
        ]);
    }

    /**
     * Mock POS menu.
     */
    public function menu()
    {
        return response()->json([
            'success' => true,

            'categories' => [
                /*
                |--------------------------------------------------------------------------
                | MAIN COURSE
                |--------------------------------------------------------------------------
                */
                [
                    'external_category_id' =>
                        'CAT-001',

                    'name' =>
                        'Main Course',

                    'description' =>
                        'Popular Indian main course dishes.',

                    'sort_order' =>
                        1,

                    'is_active' =>
                        true,

                    'items' => [
                        [
                            'external_item_id' =>
                                'MENU-101',

                            'name' =>
                                'Chicken Tikka Masala',

                            'description' =>
                                'Creamy chicken tikka curry.',

                            'price' =>
                                14.00,

                            'food_type' =>
                                'non-veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                1,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-102',

                            'name' =>
                                'Chicken Biryani',

                            'description' =>
                                'Traditional aromatic chicken biryani.',

                            'price' =>
                                14.00,

                            'food_type' =>
                                'non-veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                2,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-103',

                            'name' =>
                                'Paneer Butter Masala',

                            'description' =>
                                'Paneer cooked in rich tomato butter gravy.',

                            'price' =>
                                12.00,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                3,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-104',

                            'name' =>
                                'Paneer Tikka',

                            'description' =>
                                'Grilled paneer with Indian spices.',

                            'price' =>
                                12.00,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                4,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-105',

                            'name' =>
                                'Garlic Naan',

                            'description' =>
                                'Fresh naan with garlic butter.',

                            'price' =>
                                5.00,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                5,
                        ],
                    ],
                ],

                /*
                |--------------------------------------------------------------------------
                | BEVERAGES
                |--------------------------------------------------------------------------
                */
                [
                    'external_category_id' =>
                        'CAT-002',

                    'name' =>
                        'Beverages',

                    'description' =>
                        'Cold and hot beverages.',

                    'sort_order' =>
                        2,

                    'is_active' =>
                        true,

                    'items' => [
                        [
                            'external_item_id' =>
                                'MENU-201',

                            'name' =>
                                'Cold Coffee',

                            'description' =>
                                'Chilled creamy coffee.',

                            'price' =>
                                6.50,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                1,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-202',

                            'name' =>
                                'Mango Lassi',

                            'description' =>
                                'Sweet mango yogurt drink.',

                            'price' =>
                                5.50,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                2,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-203',

                            'name' =>
                                'Masala Chai',

                            'description' =>
                                'Indian tea with milk and spices.',

                            'price' =>
                                3.50,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                3,
                        ],
                    ],
                ],

                /*
                |--------------------------------------------------------------------------
                | DESSERTS
                |--------------------------------------------------------------------------
                */
                [
                    'external_category_id' =>
                        'CAT-003',

                    'name' =>
                        'Desserts',

                    'description' =>
                        'Traditional Indian desserts.',

                    'sort_order' =>
                        3,

                    'is_active' =>
                        true,

                    'items' => [
                        [
                            'external_item_id' =>
                                'MENU-301',

                            'name' =>
                                'Gulab Jamun',

                            'description' =>
                                'Traditional warm Indian dessert.',

                            'price' =>
                                5.00,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                1,
                        ],

                        [
                            'external_item_id' =>
                                'MENU-302',

                            'name' =>
                                'Kulfi',

                            'description' =>
                                'Traditional Indian frozen dessert.',

                            'price' =>
                                6.00,

                            'food_type' =>
                                'veg',

                            'is_available' =>
                                true,

                            'is_active' =>
                                true,

                            'sort_order' =>
                                2,
                        ],
                    ],
                ],
            ],
        ]);
    }

    /**
     * Mock POS orders for development testing.
     */
    public function orders(
        Request $request
    ) {
        /*
        |--------------------------------------------------------------------------
        | Incremental sync window
        |--------------------------------------------------------------------------
        */

        $start =
            $request->query('start');

        $end =
            $request->query('end');

        try {
            $startDate =
                $start
                    ? Carbon::parse($start)
                    : now()->subDays(7);

            $endDate =
                $end
                    ? Carbon::parse($end)
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
        */

        $order1001Created =
            now()->subHours(3);

        $order1001Updated =
            now()->subHours(2);

        $order1002Created =
            now()->subHour();

        $order1002Updated =
            now()->subMinutes(2);

        $order1003Created =
            now()->subMinutes(20);

        $order1003Updated =
            now()->subMinute();

        /*
         * New orders intentionally use recent updated timestamps.
         *
         * This makes them appear during incremental Sync Now testing
         * even if the POS connection has already synced previously.
         */

        $recentCreated =
            now()->subMinutes(3);

        $recentUpdated =
            now()->subSeconds(20);

        $orders = [
            /*
            |--------------------------------------------------------------------------
            | ORDER 1001
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1001',

                'external_location_id' =>
                    'location_demo_001',

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
                    $order1001Created
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $order1001Updated
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
                            $order1001Updated
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
            | ORDER 1002
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1002',

                'external_location_id' =>
                    'location_demo_001',

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
                    'priya@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    12.00,

                'tax_amount' =>
                    1.20,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    0,

                'total' =>
                    13.20,

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
                    $order1002Created
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $order1002Updated
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1002-A',

                        'external_menu_item_id' =>
                            'MENU-103',

                        'item_name' =>
                            'Paneer Butter Masala',

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
                ],

                'payments' => [
                    [
                        'external_payment_id' =>
                            'PAY-MOCK-1002',

                        'type' =>
                            'cash',

                        'amount' =>
                            13.20,

                        'tip_amount' =>
                            0,

                        'paid_at' =>
                            $order1002Updated
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
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1003
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1003',

                'external_location_id' =>
                    'location_demo_002',

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
                    $order1003Created
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $order1003Updated
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
                            $order1003Updated
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
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1004
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1004',

                'external_location_id' =>
                    'location_demo_001',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'dine_in',

                'table_number' =>
                    'T-02',

                'customer_name' =>
                    'Neha Singh',

                'customer_phone' =>
                    '9876500004',

                'customer_email' =>
                    'neha@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    20.50,

                'tax_amount' =>
                    2.05,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    1.50,

                'total' =>
                    24.05,

                'status' =>
                    'completed',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1004',

                'payment_method' =>
                    'card',

                'special_instructions' =>
                    null,

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinutes(7)
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSeconds(7)
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1004-A',

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

                        'modifiers' =>
                            [],

                        'raw_data' => [
                            'mock' =>
                                true,
                        ],
                    ],

                    [
                        'external_item_id' =>
                            'ITEM-1004-B',

                        'external_menu_item_id' =>
                            'MENU-201',

                        'item_name' =>
                            'Cold Coffee',

                        'unit_price' =>
                            6.50,

                        'quantity' =>
                            1,

                        'total_price' =>
                            6.50,

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
                            'PAY-MOCK-1004',

                        'type' =>
                            'card',

                        'amount' =>
                            24.05,

                        'tip_amount' =>
                            1.50,

                        'card_type' =>
                            'VISA',

                        'paid_at' =>
                            $recentUpdated
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
                        '1004',
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1005
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1005',

                'external_location_id' =>
                    'location_demo_001',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'takeaway',

                'table_number' =>
                    null,

                'customer_name' =>
                    'Rohan Mehta',

                'customer_phone' =>
                    '9876500005',

                'customer_email' =>
                    'rohan@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    19.50,

                'tax_amount' =>
                    1.95,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    0,

                'total' =>
                    21.45,

                'status' =>
                    'ready',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1005',

                'payment_method' =>
                    'upi',

                'special_instructions' =>
                    'Pack separately',

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinutes(6)
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSeconds(6)
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1005-A',

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

                    [
                        'external_item_id' =>
                            'ITEM-1005-B',

                        'external_menu_item_id' =>
                            'MENU-202',

                        'item_name' =>
                            'Mango Lassi',

                        'unit_price' =>
                            5.50,

                        'quantity' =>
                            1,

                        'total_price' =>
                            5.50,

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
                            'PAY-MOCK-1005',

                        'type' =>
                            'upi',

                        'amount' =>
                            21.45,

                        'tip_amount' =>
                            0,

                        'paid_at' =>
                            $recentUpdated
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
                        '1005',
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1006
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1006',

                'external_location_id' =>
                    'location_demo_002',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'dine_in',

                'table_number' =>
                    'T-11',

                'customer_name' =>
                    'Simran Kaur',

                'customer_phone' =>
                    '9876500006',

                'customer_email' =>
                    'simran@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    27.50,

                'tax_amount' =>
                    2.75,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    2.50,

                'total' =>
                    32.75,

                'status' =>
                    'preparing',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1006',

                'payment_method' =>
                    'card',

                'special_instructions' =>
                    'Medium spicy',

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinutes(5)
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSeconds(5)
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1006-A',

                        'external_menu_item_id' =>
                            'MENU-103',

                        'item_name' =>
                            'Paneer Butter Masala',

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
                            'ITEM-1006-B',

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

                    [
                        'external_item_id' =>
                            'ITEM-1006-C',

                        'external_menu_item_id' =>
                            'MENU-202',

                        'item_name' =>
                            'Mango Lassi',

                        'unit_price' =>
                            5.50,

                        'quantity' =>
                            1,

                        'total_price' =>
                            5.50,

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
                            'PAY-MOCK-1006',

                        'type' =>
                            'card',

                        'amount' =>
                            32.75,

                        'tip_amount' =>
                            2.50,

                        'card_type' =>
                            'RUPAY',

                        'paid_at' =>
                            $recentUpdated
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
                        '1006',
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1007
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1007',

                'external_location_id' =>
                    'location_demo_001',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'takeaway',

                'table_number' =>
                    null,

                'customer_name' =>
                    'Arjun Malhotra',

                'customer_phone' =>
                    '9876500007',

                'customer_email' =>
                    'arjun@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    17.50,

                'tax_amount' =>
                    1.75,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    0,

                'total' =>
                    19.25,

                'status' =>
                    'completed',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1007',

                'payment_method' =>
                    'cash',

                'special_instructions' =>
                    null,

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinutes(4)
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSeconds(4)
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1007-A',

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
                            'ITEM-1007-B',

                        'external_menu_item_id' =>
                            'MENU-202',

                        'item_name' =>
                            'Mango Lassi',

                        'unit_price' =>
                            5.50,

                        'quantity' =>
                            1,

                        'total_price' =>
                            5.50,

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
                            'PAY-MOCK-1007',

                        'type' =>
                            'cash',

                        'amount' =>
                            19.25,

                        'tip_amount' =>
                            0,

                        'paid_at' =>
                            $recentUpdated
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
                        '1007',
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1008
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1008',

                'external_location_id' =>
                    'location_demo_002',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'dine_in',

                'table_number' =>
                    'T-06',

                'customer_name' =>
                    'Meera Joshi',

                'customer_phone' =>
                    '9876500008',

                'customer_email' =>
                    'meera@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    25.50,

                'tax_amount' =>
                    2.55,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    2.00,

                'total' =>
                    30.05,

                'status' =>
                    'completed',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1008',

                'payment_method' =>
                    'card',

                'special_instructions' =>
                    'Birthday table',

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinutes(3)
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSeconds(3)
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1008-A',

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

                    [
                        'external_item_id' =>
                            'ITEM-1008-B',

                        'external_menu_item_id' =>
                            'MENU-202',

                        'item_name' =>
                            'Mango Lassi',

                        'unit_price' =>
                            5.50,

                        'quantity' =>
                            1,

                        'total_price' =>
                            5.50,

                        'modifiers' =>
                            [],

                        'raw_data' => [
                            'mock' =>
                                true,
                        ],
                    ],

                    [
                        'external_item_id' =>
                            'ITEM-1008-C',

                        'external_menu_item_id' =>
                            'MENU-302',

                        'item_name' =>
                            'Kulfi',

                        'unit_price' =>
                            6.00,

                        'quantity' =>
                            1,

                        'total_price' =>
                            6.00,

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
                            'PAY-MOCK-1008',

                        'type' =>
                            'card',

                        'amount' =>
                            30.05,

                        'tip_amount' =>
                            2.00,

                        'card_type' =>
                            'VISA',

                        'paid_at' =>
                            $recentUpdated
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
                        '1008',
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1009
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1009',

                'external_location_id' =>
                    'location_demo_001',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'takeaway',

                'table_number' =>
                    null,

                'customer_name' =>
                    'Vikram Gupta',

                'customer_phone' =>
                    '9876500009',

                'customer_email' =>
                    'vikram@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    18.50,

                'tax_amount' =>
                    1.85,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    0,

                'total' =>
                    20.35,

                'status' =>
                    'pending',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1009',

                'payment_method' =>
                    'upi',

                'special_instructions' =>
                    'Call when ready',

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinutes(2)
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSeconds(2)
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1009-A',

                        'external_menu_item_id' =>
                            'MENU-103',

                        'item_name' =>
                            'Paneer Butter Masala',

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
                            'ITEM-1009-B',

                        'external_menu_item_id' =>
                            'MENU-201',

                        'item_name' =>
                            'Cold Coffee',

                        'unit_price' =>
                            6.50,

                        'quantity' =>
                            1,

                        'total_price' =>
                            6.50,

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
                            'PAY-MOCK-1009',

                        'type' =>
                            'upi',

                        'amount' =>
                            20.35,

                        'tip_amount' =>
                            0,

                        'paid_at' =>
                            $recentUpdated
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
                        '1009',
                ],
            ],

            /*
            |--------------------------------------------------------------------------
            | ORDER 1010
            |--------------------------------------------------------------------------
            */
            [
                'external_order_id' =>
                    'MOCK-ORDER-1010',

                'external_location_id' =>
                    'location_demo_002',

                'source' =>
                    'custom_api',

                'order_type' =>
                    'dine_in',

                'table_number' =>
                    'T-15',

                'customer_name' =>
                    'Ananya Rao',

                'customer_phone' =>
                    '9876500010',

                'customer_email' =>
                    'ananya@example.com',

                'delivery_address' =>
                    null,

                'subtotal' =>
                    30.00,

                'tax_amount' =>
                    3.00,

                'delivery_charge' =>
                    0,

                'tip_amount' =>
                    3.00,

                'total' =>
                    36.00,

                'status' =>
                    'completed',

                'payment_status' =>
                    'paid',

                'payment_id' =>
                    'PAY-MOCK-1010',

                'payment_method' =>
                    'card',

                'special_instructions' =>
                    'Window side table',

                'pos_created_at' =>
                    $recentCreated
                        ->copy()
                        ->subMinute()
                        ->toIso8601String(),

                'pos_updated_at' =>
                    $recentUpdated
                        ->copy()
                        ->subSecond()
                        ->toIso8601String(),

                'items' => [
                    [
                        'external_item_id' =>
                            'ITEM-1010-A',

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

                        'modifiers' =>
                            [],

                        'raw_data' => [
                            'mock' =>
                                true,
                        ],
                    ],

                    [
                        'external_item_id' =>
                            'ITEM-1010-B',

                        'external_menu_item_id' =>
                            'MENU-105',

                        'item_name' =>
                            'Garlic Naan',

                        'unit_price' =>
                            5.00,

                        'quantity' =>
                            1,

                        'total_price' =>
                            5.00,

                        'modifiers' =>
                            [],

                        'raw_data' => [
                            'mock' =>
                                true,
                        ],
                    ],

                    [
                        'external_item_id' =>
                            'ITEM-1010-C',

                        'external_menu_item_id' =>
                            'MENU-203',

                        'item_name' =>
                            'Masala Chai',

                        'unit_price' =>
                            3.50,

                        'quantity' =>
                            2,

                        'total_price' =>
                            7.00,

                        'modifiers' =>
                            [],

                        'raw_data' => [
                            'mock' =>
                                true,
                        ],
                    ],

                    [
                        'external_item_id' =>
                            'ITEM-1010-D',

                        'external_menu_item_id' =>
                            'MENU-301',

                        'item_name' =>
                            'Gulab Jamun',

                        'unit_price' =>
                            5.00,

                        'quantity' =>
                            1,

                        'total_price' =>
                            5.00,

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
                            'PAY-MOCK-1010',

                        'type' =>
                            'card',

                        'amount' =>
                            36.00,

                        'tip_amount' =>
                            3.00,

                        'card_type' =>
                            'MASTERCARD',

                        'paid_at' =>
                            $recentUpdated
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
                        '1010',
                ],
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Incremental filtering
        |--------------------------------------------------------------------------
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
                                Carbon::parse(
                                    $updatedAt
                                );
                        } catch (\Throwable) {
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