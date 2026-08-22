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
     * Mock POS locations.
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
                        $this->menuItem(
                            'MENU-101',
                            'Chicken Tikka Masala',
                            'Creamy chicken tikka curry.',
                            14.00,
                            'non-veg',
                            1
                        ),

                        $this->menuItem(
                            'MENU-102',
                            'Chicken Biryani',
                            'Traditional aromatic chicken biryani.',
                            14.00,
                            'non-veg',
                            2
                        ),

                        $this->menuItem(
                            'MENU-103',
                            'Paneer Butter Masala',
                            'Paneer cooked in rich tomato butter gravy.',
                            12.00,
                            'veg',
                            3
                        ),

                        $this->menuItem(
                            'MENU-104',
                            'Paneer Tikka',
                            'Grilled paneer with Indian spices.',
                            12.00,
                            'veg',
                            4
                        ),

                        $this->menuItem(
                            'MENU-105',
                            'Garlic Naan',
                            'Fresh naan with garlic butter.',
                            5.00,
                            'veg',
                            5
                        ),
                    ],
                ],

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
                        $this->menuItem(
                            'MENU-201',
                            'Cold Coffee',
                            'Chilled creamy coffee.',
                            6.50,
                            'veg',
                            1
                        ),

                        $this->menuItem(
                            'MENU-202',
                            'Mango Lassi',
                            'Sweet mango yogurt drink.',
                            5.50,
                            'veg',
                            2
                        ),

                        $this->menuItem(
                            'MENU-203',
                            'Masala Chai',
                            'Indian tea with milk and spices.',
                            3.50,
                            'veg',
                            3
                        ),
                    ],
                ],

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
                        $this->menuItem(
                            'MENU-301',
                            'Gulab Jamun',
                            'Traditional warm Indian dessert.',
                            5.00,
                            'veg',
                            1
                        ),

                        $this->menuItem(
                            'MENU-302',
                            'Kulfi',
                            'Traditional Indian frozen dessert.',
                            6.00,
                            'veg',
                            2
                        ),
                    ],
                ],
            ],
        ]);
    }

    /**
     * Mock POS orders.
     *
     * 35 orders are distributed across:
     * - today
     * - last 7 days
     * - current month
     *
     * pos_created_at controls analytics date.
     * pos_updated_at stays recent so new demo data
     * can be picked up by incremental Sync Now.
     */
    public function orders(
        Request $request
    ) {
        $start =
            $request->query('start');

        $end =
            $request->query('end');

        try {
            $startDate =
                $start
                    ? Carbon::parse($start)
                    : now()->subDays(30);

            $endDate =
                $end
                    ? Carbon::parse($end)
                    : now();
        } catch (\Throwable $exception) {
            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'Invalid start or end date.',
            ], 422);
        }

        $orders = [];

        foreach (
            $this->orderBlueprints()
            as $index => $blueprint
        ) {
            $orders[] =
                $this->buildOrder(
                    $index,
                    $blueprint
                );
        }

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

    /**
     * Build one menu item.
     */
    private function menuItem(
        string $id,
        string $name,
        string $description,
        float $price,
        string $foodType,
        int $sortOrder
    ): array {
        return [
            'external_item_id' =>
                $id,

            'name' =>
                $name,

            'description' =>
                $description,

            'price' =>
                $price,

            'food_type' =>
                $foodType,

            'is_available' =>
                true,

            'is_active' =>
                true,

            'sort_order' =>
                $sortOrder,
        ];
    }

    /**
     * Menu lookup used by mock orders.
     */
    private function catalog(): array
    {
        return [
            'MENU-101' => [
                'name' =>
                    'Chicken Tikka Masala',

                'price' =>
                    14.00,
            ],

            'MENU-102' => [
                'name' =>
                    'Chicken Biryani',

                'price' =>
                    14.00,
            ],

            'MENU-103' => [
                'name' =>
                    'Paneer Butter Masala',

                'price' =>
                    12.00,
            ],

            'MENU-104' => [
                'name' =>
                    'Paneer Tikka',

                'price' =>
                    12.00,
            ],

            'MENU-105' => [
                'name' =>
                    'Garlic Naan',

                'price' =>
                    5.00,
            ],

            'MENU-201' => [
                'name' =>
                    'Cold Coffee',

                'price' =>
                    6.50,
            ],

            'MENU-202' => [
                'name' =>
                    'Mango Lassi',

                'price' =>
                    5.50,
            ],

            'MENU-203' => [
                'name' =>
                    'Masala Chai',

                'price' =>
                    3.50,
            ],

            'MENU-301' => [
                'name' =>
                    'Gulab Jamun',

                'price' =>
                    5.00,
            ],

            'MENU-302' => [
                'name' =>
                    'Kulfi',

                'price' =>
                    6.00,
            ],
        ];
    }

    /**
     * 35 realistic demo orders.
     *
     * days_ago controls analytics date.
     * hour controls the Day chart.
     */
    private function orderBlueprints(): array
    {
        return [
            /*
            |--------------------------------------------------------------------------
            | TODAY - 10 ORDERS
            |--------------------------------------------------------------------------
            */

            [
                'days_ago' => 0,
                'hour' => 9,
                'minute' => 15,
                'items' => [
                    ['MENU-203', 2],
                    ['MENU-105', 1],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 0,
                'hour' => 10,
                'minute' => 30,
                'items' => [
                    ['MENU-103', 1],
                    ['MENU-105', 2],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 0,
                'hour' => 11,
                'minute' => 45,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-202', 2],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 0,
                'hour' => 12,
                'minute' => 20,
                'items' => [
                    ['MENU-101', 1],
                    ['MENU-105', 3],
                    ['MENU-201', 1],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 0,
                'hour' => 13,
                'minute' => 10,
                'items' => [
                    ['MENU-102', 1],
                    ['MENU-105', 2],
                    ['MENU-202', 1],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 0,
                'hour' => 14,
                'minute' => 5,
                'items' => [
                    ['MENU-103', 2],
                    ['MENU-105', 4],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 0,
                'hour' => 16,
                'minute' => 20,
                'items' => [
                    ['MENU-104', 1],
                    ['MENU-201', 2],
                ],
                'payment' => 'cash',
                'status' => 'ready',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 0,
                'hour' => 18,
                'minute' => 15,
                'items' => [
                    ['MENU-101', 2],
                    ['MENU-105', 4],
                    ['MENU-202', 2],
                ],
                'payment' => 'card',
                'status' => 'preparing',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 0,
                'hour' => 20,
                'minute' => 10,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-105', 3],
                    ['MENU-301', 2],
                ],
                'payment' => 'upi',
                'status' => 'pending',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 0,
                'hour' => 21,
                'minute' => 25,
                'items' => [
                    ['MENU-101', 1],
                    ['MENU-103', 1],
                    ['MENU-105', 3],
                    ['MENU-302', 1],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            /*
            |--------------------------------------------------------------------------
            | YESTERDAY - 5
            |--------------------------------------------------------------------------
            */

            [
                'days_ago' => 1,
                'hour' => 11,
                'minute' => 20,
                'items' => [
                    ['MENU-103', 1],
                    ['MENU-202', 1],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 1,
                'hour' => 13,
                'minute' => 15,
                'items' => [
                    ['MENU-102', 3],
                    ['MENU-105', 5],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 1,
                'hour' => 15,
                'minute' => 40,
                'items' => [
                    ['MENU-104', 2],
                    ['MENU-201', 2],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 1,
                'hour' => 19,
                'minute' => 5,
                'items' => [
                    ['MENU-101', 3],
                    ['MENU-105', 6],
                    ['MENU-202', 2],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 1,
                'hour' => 21,
                'minute' => 10,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-301', 1],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            /*
            |--------------------------------------------------------------------------
            | 2 DAYS AGO - 5
            |--------------------------------------------------------------------------
            */

            [
                'days_ago' => 2,
                'hour' => 10,
                'minute' => 10,
                'items' => [
                    ['MENU-203', 2],
                    ['MENU-104', 1],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 2,
                'hour' => 12,
                'minute' => 35,
                'items' => [
                    ['MENU-103', 2],
                    ['MENU-105', 3],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 2,
                'hour' => 14,
                'minute' => 20,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-202', 2],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 2,
                'hour' => 18,
                'minute' => 25,
                'items' => [
                    ['MENU-101', 2],
                    ['MENU-105', 5],
                    ['MENU-201', 1],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 2,
                'hour' => 20,
                'minute' => 45,
                'items' => [
                    ['MENU-102', 3],
                    ['MENU-105', 4],
                    ['MENU-302', 1],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            /*
            |--------------------------------------------------------------------------
            | 3-6 DAYS AGO - WEEK DATA
            |--------------------------------------------------------------------------
            */

            [
                'days_ago' => 3,
                'hour' => 12,
                'minute' => 15,
                'items' => [
                    ['MENU-103', 1],
                    ['MENU-105', 2],
                    ['MENU-202', 1],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 3,
                'hour' => 19,
                'minute' => 30,
                'items' => [
                    ['MENU-101', 3],
                    ['MENU-105', 5],
                    ['MENU-301', 2],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 4,
                'hour' => 13,
                'minute' => 5,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-201', 2],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 4,
                'hour' => 20,
                'minute' => 10,
                'items' => [
                    ['MENU-101', 2],
                    ['MENU-103', 1],
                    ['MENU-105', 5],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 5,
                'hour' => 12,
                'minute' => 25,
                'items' => [
                    ['MENU-104', 2],
                    ['MENU-202', 2],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 5,
                'hour' => 19,
                'minute' => 50,
                'items' => [
                    ['MENU-102', 4],
                    ['MENU-105', 5],
                    ['MENU-301', 1],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 6,
                'hour' => 13,
                'minute' => 35,
                'items' => [
                    ['MENU-103', 2],
                    ['MENU-105', 4],
                    ['MENU-201', 1],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 6,
                'hour' => 20,
                'minute' => 15,
                'items' => [
                    ['MENU-101', 4],
                    ['MENU-105', 6],
                    ['MENU-202', 3],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            /*
            |--------------------------------------------------------------------------
            | OLDER CURRENT-MONTH DATA
            |--------------------------------------------------------------------------
            */

            [
                'days_ago' => 9,
                'hour' => 13,
                'minute' => 20,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-105', 2],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 11,
                'hour' => 19,
                'minute' => 5,
                'items' => [
                    ['MENU-101', 3],
                    ['MENU-105', 5],
                    ['MENU-202', 2],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 14,
                'hour' => 12,
                'minute' => 40,
                'items' => [
                    ['MENU-103', 3],
                    ['MENU-105', 4],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 17,
                'hour' => 20,
                'minute' => 10,
                'items' => [
                    ['MENU-102', 3],
                    ['MENU-201', 2],
                    ['MENU-301', 1],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 20,
                'hour' => 13,
                'minute' => 25,
                'items' => [
                    ['MENU-104', 2],
                    ['MENU-105', 3],
                    ['MENU-202', 1],
                ],
                'payment' => 'cash',
                'status' => 'completed',
                'type' => 'takeaway',
            ],

            [
                'days_ago' => 23,
                'hour' => 19,
                'minute' => 45,
                'items' => [
                    ['MENU-101', 3],
                    ['MENU-105', 5],
                    ['MENU-302', 1],
                ],
                'payment' => 'card',
                'status' => 'completed',
                'type' => 'dine_in',
            ],

            [
                'days_ago' => 26,
                'hour' => 18,
                'minute' => 15,
                'items' => [
                    ['MENU-102', 2],
                    ['MENU-103', 1],
                    ['MENU-105', 4],
                ],
                'payment' => 'upi',
                'status' => 'completed',
                'type' => 'dine_in',
            ],
        ];
    }

    /**
     * Build normalized mock order.
     */
    private function buildOrder(
        int $index,
        array $blueprint
    ): array {
        $catalog =
            $this->catalog();

        $number =
            1001 + $index;

        $createdAt =
            now()
                ->subDays(
                    (int)
                    $blueprint[
                        'days_ago'
                    ]
                )
                ->setTime(
                    (int)
                    $blueprint[
                        'hour'
                    ],
                    (int)
                    $blueprint[
                        'minute'
                    ],
                    0
                );

        /*
         * Keep update time recent so newly-added historical
         * mock orders are returned by incremental Sync Now.
         */

        $updatedAt =
            now()
                ->subSeconds(
                    10 + $index
                );

        $items = [];

        $subtotal = 0;

        foreach (
            $blueprint['items']
            as $itemIndex => $row
        ) {
            [
                $menuId,
                $quantity,
            ] = $row;

            $menuItem =
                $catalog[$menuId];

            $unitPrice =
                (float)
                $menuItem[
                    'price'
                ];

            $lineTotal =
                $unitPrice *
                (int) $quantity;

            $subtotal +=
                $lineTotal;

            $items[] = [
                'external_item_id' =>
                    'ITEM-' .
                    $number .
                    '-' .
                    ($itemIndex + 1),

                'external_menu_item_id' =>
                    $menuId,

                'item_name' =>
                    $menuItem[
                        'name'
                    ],

                'unit_price' =>
                    round(
                        $unitPrice,
                        2
                    ),

                'quantity' =>
                    (int)
                    $quantity,

                'total_price' =>
                    round(
                        $lineTotal,
                        2
                    ),

                'modifiers' =>
                    [],

                'raw_data' => [
                    'mock' =>
                        true,
                ],
            ];
        }

        $tax =
            round(
                $subtotal *
                0.10,
                2
            );

        $tip =
            $blueprint[
                'type'
            ] === 'dine_in'
                ? round(
                    min(
                        5,
                        $subtotal *
                        0.05
                    ),
                    2
                )
                : 0;

        $total =
            round(
                $subtotal +
                $tax +
                $tip,
                2
            );

        $paymentMethod =
            $blueprint[
                'payment'
            ];

        $cardTypes = [
            'VISA',
            'MASTERCARD',
            'RUPAY',
        ];

        $cardType =
            $paymentMethod ===
            'card'
                ? $cardTypes[
                    $index %
                    count(
                        $cardTypes
                    )
                ]
                : null;

        $location =
            $index % 4 === 0
                ? 'location_demo_002'
                : 'location_demo_001';

        $table =
            $blueprint[
                'type'
            ] === 'dine_in'
                ? 'T-' .
                    str_pad(
                        (string)
                        (
                            ($index % 18)
                            + 1
                        ),
                        2,
                        '0',
                        STR_PAD_LEFT
                    )
                : null;

        return [
            'external_order_id' =>
                'MOCK-ORDER-' .
                $number,

            'external_location_id' =>
                $location,

            'source' =>
                'custom_api',

            'order_type' =>
                $blueprint[
                    'type'
                ],

            'table_number' =>
                $table,

            'customer_name' =>
                'Demo Customer ' .
                $number,

            'customer_phone' =>
                '98' .
                str_pad(
                    (string)
                    $number,
                    8,
                    '0',
                    STR_PAD_LEFT
                ),

            'customer_email' =>
                'customer' .
                $number .
                '@example.com',

            'delivery_address' =>
                null,

            'subtotal' =>
                round(
                    $subtotal,
                    2
                ),

            'tax_amount' =>
                $tax,

            'delivery_charge' =>
                0,

            'tip_amount' =>
                $tip,

            'total' =>
                $total,

            'status' =>
                $blueprint[
                    'status'
                ],

            'payment_status' =>
                'paid',

            'payment_id' =>
                'PAY-MOCK-' .
                $number,

            'payment_method' =>
                $paymentMethod,

            'special_instructions' =>
                null,

            'pos_created_at' =>
                $createdAt
                    ->toIso8601String(),

            'pos_updated_at' =>
                $updatedAt
                    ->toIso8601String(),

            'items' =>
                $items,

            'payments' => [
                [
                    'external_payment_id' =>
                        'PAY-MOCK-' .
                        $number,

                    'type' =>
                        $paymentMethod,

                    'amount' =>
                        $total,

                    'tip_amount' =>
                        $tip,

                    'card_type' =>
                        $cardType,

                    'paid_at' =>
                        $updatedAt
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
                    (string)
                    $number,

                'analytics_demo' =>
                    true,
            ],
        ];
    }
}