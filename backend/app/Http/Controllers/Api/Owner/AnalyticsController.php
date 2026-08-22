<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Restaurant analytics dashboard.
     *
     * Supports:
     * - day
     * - week
     * - month
     * - custom date range
     */
    public function overview(Request $request)
    {
        $user = $request->user();

        if (
            !$user ||
            !$user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Period / custom date validation
        |--------------------------------------------------------------------------
        */

        $request->validate([
            'period' => [
                'nullable',
                'string',
                'in:day,week,month',
            ],

            'start_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'end_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],
        ]);

        $customStart =
            $request->query(
                'start_date'
            );

        $customEnd =
            $request->query(
                'end_date'
            );

        /*
         * Require both custom dates.
         */

        if (
            ($customStart && !$customEnd) ||
            (!$customStart && $customEnd)
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Both start_date and end_date are required for a custom date range.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Resolve dates
        |--------------------------------------------------------------------------
        */

        if (
            $customStart &&
            $customEnd
        ) {
            $period =
                'custom';

            $start =
                Carbon::createFromFormat(
                    'Y-m-d',
                    $customStart
                )->startOfDay();

            $end =
                Carbon::createFromFormat(
                    'Y-m-d',
                    $customEnd
                )->endOfDay();

            if (
                $start->gt($end)
            ) {
                return response()->json([
                    'success' => false,

                    'message' =>
                        'Start date cannot be after end date.',
                ], 422);
            }

            /*
             * Prevent unreasonable dashboard ranges.
             */

            if (
                $start
                    ->copy()
                    ->startOfDay()
                    ->diffInDays(
                        $end
                            ->copy()
                            ->startOfDay()
                    ) > 366
            ) {
                return response()->json([
                    'success' => false,

                    'message' =>
                        'Custom analytics range cannot exceed 366 days.',
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Previous equal-length period
            |--------------------------------------------------------------------------
            |
            | Example:
            |
            | Current:
            | 10 Aug - 16 Aug
            |
            | Previous:
            | 3 Aug - 9 Aug
            |
            */

            $days =
                $start
                    ->copy()
                    ->startOfDay()
                    ->diffInDays(
                        $end
                            ->copy()
                            ->startOfDay()
                    ) + 1;

            $previousEnd =
                $start
                    ->copy()
                    ->subSecond();

            $previousStart =
                $previousEnd
                    ->copy()
                    ->subDays(
                        $days - 1
                    )
                    ->startOfDay();
        } else {
            $period =
                (string)
                    $request->query(
                        'period',
                        'day'
                    );

            if (
                !in_array(
                    $period,
                    [
                        'day',
                        'week',
                        'month',
                    ],
                    true
                )
            ) {
                $period =
                    'day';
            }

            [
                $start,
                $end,
                $previousStart,
                $previousEnd,
            ] =
                $this->periodDates(
                    $period
                );
        }

        $restaurantId =
            (int)
                $user
                    ->restaurant_id;



        $restaurant =
            $user->restaurant;

        $currency =
            $restaurant?->currency
            ?? 'INR';

        /*
        |--------------------------------------------------------------------------
        | Current paid orders
        |--------------------------------------------------------------------------
        */

        $currentOrders =
            $this->ordersForPeriod(
                $restaurantId,
                $start,
                $end
            )
                ->where(
                    'payment_status',
                    'paid'
                )
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Previous paid orders
        |--------------------------------------------------------------------------
        */

        $previousOrders =
            $this->ordersForPeriod(
                $restaurantId,
                $previousStart,
                $previousEnd
            )
                ->where(
                    'payment_status',
                    'paid'
                )
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Revenue
        |--------------------------------------------------------------------------
        */

        $revenue =
            round(
                (float)
                    $currentOrders
                        ->sum('total'),
                2
            );

        $previousRevenue =
            round(
                (float)
                    $previousOrders
                        ->sum('total'),
                2
            );

        /*
        |--------------------------------------------------------------------------
        | Orders
        |--------------------------------------------------------------------------
        */

        $ordersCount =
            $currentOrders
                ->count();

        $previousOrdersCount =
            $previousOrders
                ->count();

        /*
        |--------------------------------------------------------------------------
        | Average order value
        |--------------------------------------------------------------------------
        */

        $averageOrderValue =
            $ordersCount > 0
                ? round(
                    $revenue /
                    $ordersCount,
                    2
                )
                : 0;

        $previousAverageOrderValue =
            $previousOrdersCount > 0
                ? round(
                    $previousRevenue /
                    $previousOrdersCount,
                    2
                )
                : 0;

        /*
        |--------------------------------------------------------------------------
        | All current orders
        |--------------------------------------------------------------------------
        */

        $allCurrentOrders =
            $this->ordersForPeriod(
                $restaurantId,
                $start,
                $end
            )->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' =>
                true,

            'period' =>
                $period,

            'currency' =>
                $currency,

            /*
            |--------------------------------------------------------------------------
            | Current range
            |--------------------------------------------------------------------------
            */

            'period_range' => [
                'start' =>
                    $start
                        ->toIso8601String(),

                'end' =>
                    $end
                        ->toIso8601String(),

                'start_date' =>
                    $start
                        ->toDateString(),

                'end_date' =>
                    $end
                        ->toDateString(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Comparison range
            |--------------------------------------------------------------------------
            */

            'previous_period_range' => [
                'start' =>
                    $previousStart
                        ->toIso8601String(),

                'end' =>
                    $previousEnd
                        ->toIso8601String(),

                'start_date' =>
                    $previousStart
                        ->toDateString(),

                'end_date' =>
                    $previousEnd
                        ->toDateString(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Summary
            |--------------------------------------------------------------------------
            */

            'summary' => [
                'revenue' =>
                    $revenue,

                'previous_revenue' =>
                    $previousRevenue,

                'revenue_change' =>
                    $this->percentageChange(
                        $previousRevenue,
                        $revenue
                    ),

                'orders' =>
                    $ordersCount,

                'previous_orders' =>
                    $previousOrdersCount,

                'orders_change' =>
                    $this->percentageChange(
                        $previousOrdersCount,
                        $ordersCount
                    ),

                'average_order_value' =>
                    $averageOrderValue,

                'previous_average_order_value' =>
                    $previousAverageOrderValue,

                'average_order_value_change' =>
                    $this->percentageChange(
                        $previousAverageOrderValue,
                        $averageOrderValue
                    ),
            ],

            /*
            |--------------------------------------------------------------------------
            | Revenue Trend
            |--------------------------------------------------------------------------
            */

            'revenue_trend' =>
                $this->revenueTrend(
                    $restaurantId,
                    $period,
                    $start,
                    $end
                ),

            /*
            |--------------------------------------------------------------------------
            | Top Products
            |--------------------------------------------------------------------------
            */

            'top_products' =>
                $this->topProducts(
                    $restaurantId,
                    $start,
                    $end
                ),

            /*
            |--------------------------------------------------------------------------
            | Low Products
            |--------------------------------------------------------------------------
            */

            'low_products' =>
                $this->lowProducts(
                    $restaurantId,
                    $start,
                    $end
                ),

            /*
            |--------------------------------------------------------------------------
            | Order Status
            |--------------------------------------------------------------------------
            */

            'order_status' => [
                'pending' =>
                    $allCurrentOrders
                        ->where(
                            'status',
                            'pending'
                        )
                        ->count(),

                'preparing' =>
                    $allCurrentOrders
                        ->where(
                            'status',
                            'preparing'
                        )
                        ->count(),

                'ready' =>
                    $allCurrentOrders
                        ->where(
                            'status',
                            'ready'
                        )
                        ->count(),

                'completed' =>
                    $allCurrentOrders
                        ->where(
                            'status',
                            'completed'
                        )
                        ->count(),

                'cancelled' =>
                    $allCurrentOrders
                        ->where(
                            'status',
                            'cancelled'
                        )
                        ->count(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Payment Methods
            |--------------------------------------------------------------------------
            */

            'payment_methods' =>
                $this->paymentMethods(
                    $restaurantId,
                    $start,
                    $end
                ),
        ]);
    }

    /**
     * Orders inside analytics window.
     *
     * POS orders use pos_created_at.
     * Website orders fall back to created_at.
     */
    private function ordersForPeriod(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): Builder {
        return Order::query()
            ->where(
                'restaurant_id',
                $restaurantId
            )
            ->whereBetween(
                DB::raw(
                    'COALESCE(pos_created_at, created_at)'
                ),
                [
                    $start,
                    $end,
                ]
            );
    }

    /**
     * Standard periods.
     */
    private function periodDates(
        string $period
    ): array {
        $now =
            now();

        /*
        |--------------------------------------------------------------------------
        | Week
        |--------------------------------------------------------------------------
        */

        if (
            $period === 'week'
        ) {
            $start =
                $now
                    ->copy()
                    ->subDays(6)
                    ->startOfDay();

            $end =
                $now
                    ->copy()
                    ->endOfDay();

            $previousEnd =
                $start
                    ->copy()
                    ->subSecond();

            $previousStart =
                $previousEnd
                    ->copy()
                    ->subDays(6)
                    ->startOfDay();

            return [
                $start,
                $end,
                $previousStart,
                $previousEnd,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Month
        |--------------------------------------------------------------------------
        */

        if (
            $period === 'month'
        ) {
            $start =
                $now
                    ->copy()
                    ->startOfMonth();

            $end =
                $now
                    ->copy()
                    ->endOfDay();

            /*
             * Compare elapsed portion of current month
             * with the same number of days immediately
             * before the current month.
             */

            $days =
                $start
                    ->copy()
                    ->startOfDay()
                    ->diffInDays(
                        $end
                            ->copy()
                            ->startOfDay()
                    ) + 1;

            $previousEnd =
                $start
                    ->copy()
                    ->subSecond();

            $previousStart =
                $previousEnd
                    ->copy()
                    ->subDays(
                        $days - 1
                    )
                    ->startOfDay();

            return [
                $start,
                $end,
                $previousStart,
                $previousEnd,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Day
        |--------------------------------------------------------------------------
        */

        $start =
            $now
                ->copy()
                ->startOfDay();

        $end =
            $now
                ->copy()
                ->endOfDay();

        $previousStart =
            $now
                ->copy()
                ->subDay()
                ->startOfDay();

        $previousEnd =
            $now
                ->copy()
                ->subDay()
                ->endOfDay();

        return [
            $start,
            $end,
            $previousStart,
            $previousEnd,
        ];
    }

    /**
     * Revenue trend.
     */
    private function revenueTrend(
        int $restaurantId,
        string $period,
        Carbon $start,
        Carbon $end
    ): array {
        /*
         * Use hourly grouping for a single day.
         */

        $singleDay =
            $start
                ->copy()
                ->startOfDay()
                ->equalTo(
                    $end
                        ->copy()
                        ->startOfDay()
                );

        if (
            $period === 'day' ||
            $singleDay
        ) {
            $dateExpression =
                "DATE_FORMAT(
                    COALESCE(pos_created_at, created_at),
                    '%H:00'
                )";
        } else {
            $dateExpression =
                "DATE_FORMAT(
                    COALESCE(pos_created_at, created_at),
                    '%Y-%m-%d'
                )";
        }

        return Order::query()
            ->where(
                'restaurant_id',
                $restaurantId
            )
            ->where(
                'payment_status',
                'paid'
            )
            ->whereBetween(
                DB::raw(
                    'COALESCE(pos_created_at, created_at)'
                ),
                [
                    $start,
                    $end,
                ]
            )
            ->selectRaw(
                "{$dateExpression} as label"
            )
            ->selectRaw(
                'COUNT(*) as orders'
            )
            ->selectRaw(
                'ROUND(SUM(total), 2) as revenue'
            )
            ->groupByRaw(
                $dateExpression
            )
            ->orderByRaw(
                $dateExpression
            )
            ->get()
            ->map(
                function ($row) {
                    return [
                        'label' =>
                            $row->label,

                        'orders' =>
                            (int)
                                $row->orders,

                        'revenue' =>
                            round(
                                (float)
                                    $row->revenue,
                                2
                            ),
                    ];
                }
            )
            ->values()
            ->all();
    }

    /**
     * Top selling products.
     */
    private function topProducts(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        return DB::table(
            'order_items'
        )
            ->join(
                'orders',
                'orders.id',
                '=',
                'order_items.order_id'
            )
            ->where(
                'orders.restaurant_id',
                $restaurantId
            )
            ->where(
                'orders.payment_status',
                'paid'
            )
            ->whereBetween(
                DB::raw(
                    'COALESCE(orders.pos_created_at, orders.created_at)'
                ),
                [
                    $start,
                    $end,
                ]
            )
            ->select(
                'order_items.item_name'
            )
            ->selectRaw(
                'SUM(order_items.quantity) as quantity'
            )
            ->selectRaw(
                'ROUND(SUM(order_items.total_price), 2) as revenue'
            )
            ->groupBy(
                'order_items.item_name'
            )
            ->orderByDesc(
                'quantity'
            )
            ->orderByDesc(
                'revenue'
            )
            ->limit(5)
            ->get()
            ->map(
                function ($item) {
                    return [
                        'name' =>
                            $item
                                ->item_name,

                        'quantity' =>
                            (int)
                                $item
                                    ->quantity,

                        'revenue' =>
                            round(
                                (float)
                                    $item
                                        ->revenue,
                                2
                            ),
                    ];
                }
            )
            ->values()
            ->all();
    }

    /**
     * Lowest selling products
     * among products with sales.
     */
    private function lowProducts(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        return DB::table(
            'order_items'
        )
            ->join(
                'orders',
                'orders.id',
                '=',
                'order_items.order_id'
            )
            ->where(
                'orders.restaurant_id',
                $restaurantId
            )
            ->where(
                'orders.payment_status',
                'paid'
            )
            ->whereBetween(
                DB::raw(
                    'COALESCE(orders.pos_created_at, orders.created_at)'
                ),
                [
                    $start,
                    $end,
                ]
            )
            ->select(
                'order_items.item_name'
            )
            ->selectRaw(
                'SUM(order_items.quantity) as quantity'
            )
            ->selectRaw(
                'ROUND(SUM(order_items.total_price), 2) as revenue'
            )
            ->groupBy(
                'order_items.item_name'
            )
            ->orderBy(
                'quantity'
            )
            ->orderBy(
                'revenue'
            )
            ->limit(5)
            ->get()
            ->map(
                function ($item) {
                    return [
                        'name' =>
                            $item
                                ->item_name,

                        'quantity' =>
                            (int)
                                $item
                                    ->quantity,

                        'revenue' =>
                            round(
                                (float)
                                    $item
                                        ->revenue,
                                2
                            ),
                    ];
                }
            )
            ->values()
            ->all();
    }

    /**
     * Payment method breakdown.
     */
    private function paymentMethods(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        return Order::query()
            ->where(
                'restaurant_id',
                $restaurantId
            )
            ->where(
                'payment_status',
                'paid'
            )
            ->whereBetween(
                DB::raw(
                    'COALESCE(pos_created_at, created_at)'
                ),
                [
                    $start,
                    $end,
                ]
            )
            ->selectRaw(
                "COALESCE(payment_method, 'unknown') as payment_method"
            )
            ->selectRaw(
                'COUNT(*) as orders'
            )
            ->selectRaw(
                'ROUND(SUM(total), 2) as revenue'
            )
            ->groupByRaw(
                "COALESCE(payment_method, 'unknown')"
            )
            ->orderByDesc(
                'orders'
            )
            ->get()
            ->map(
                function ($row) {
                    return [
                        'payment_method' =>
                            $row
                                ->payment_method,

                        'orders' =>
                            (int)
                                $row
                                    ->orders,

                        'revenue' =>
                            round(
                                (float)
                                    $row
                                        ->revenue,
                                2
                            ),
                    ];
                }
            )
            ->values()
            ->all();
    }

    /**
     * Percentage difference.
     */
    private function percentageChange(
        float|int $previous,
        float|int $current
    ): float {
        $previous =
            (float)
                $previous;

        $current =
            (float)
                $current;

        if (
            $previous === 0.0
        ) {
            return $current > 0
                ? 100.0
                : 0.0;
        }

        return round(
            (
                (
                    $current -
                    $previous
                )
                /
                $previous
            ) * 100,
            1
        );
    }
}