<?php

namespace App\Services\Recommendations;

use App\Models\Order;
use App\Models\Restaurant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class RecommendationDataService
{
    public function build(
        Restaurant $restaurant
    ): array {
        $end = now()->endOfDay();

        $start = now()
            ->subDays(29)
            ->startOfDay();

        $previousEnd = $start
            ->copy()
            ->subSecond();

        $previousStart = $previousEnd
            ->copy()
            ->subDays(29)
            ->startOfDay();

        $currentPaidQuery =
            $this->ordersForPeriod(
                $restaurant->id,
                $start,
                $end
            )->where(
                'payment_status',
                'paid'
            );

        $previousPaidQuery =
            $this->ordersForPeriod(
                $restaurant->id,
                $previousStart,
                $previousEnd
            )->where(
                'payment_status',
                'paid'
            );

        $current =
            $this->summary(
                clone $currentPaidQuery
            );

        $previous =
            $this->summary(
                clone $previousPaidQuery
            );

        return [
            'restaurant' => [
                'name' =>
                    $restaurant->name,

                'currency' =>
                    $restaurant->currency
                    ?? 'INR',

                'timezone' =>
                    $restaurant->timezone
                    ?? 'UTC',
            ],

            'period' => [
                'start' =>
                    $start->toDateString(),

                'end' =>
                    $end->toDateString(),

                'days' => 30,
            ],

            'summary' => [
                ...$current,

                'revenue_change_percent' =>
                    $this->percentageChange(
                        $previous['revenue'],
                        $current['revenue']
                    ),

                'orders_change_percent' =>
                    $this->percentageChange(
                        $previous['orders'],
                        $current['orders']
                    ),

                'average_order_value_change_percent' =>
                    $this->percentageChange(
                        $previous[
                            'average_order_value'
                        ],
                        $current[
                            'average_order_value'
                        ]
                    ),
            ],

            'previous_period_summary' =>
                $previous,

            'daily_revenue_trend' =>
                $this->revenueTrend(
                    $restaurant->id,
                    $start,
                    $end
                ),

            'weekday_demand' =>
                $this->weekdayDemand(
                    $restaurant->id,
                    $start,
                    $end
                ),

            'top_products' =>
                $this->products(
                    $restaurant->id,
                    $start,
                    $end,
                    'desc'
                ),

            'low_products' =>
                $this->products(
                    $restaurant->id,
                    $start,
                    $end,
                    'asc'
                ),

            'order_status' =>
                $this->orderStatuses(
                    $restaurant->id,
                    $start,
                    $end
                ),

            'payment_methods' =>
                $this->paymentMethods(
                    $restaurant->id,
                    $start,
                    $end
                ),

            'data_quality' => [
                'paid_orders_available' =>
                    $current['orders'],

                'has_enough_data' =>
                    $current['orders'] >= 5,
            ],
        ];
    }

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
                [$start, $end]
            );
    }

    private function summary(
        Builder $query
    ): array {
        $result = $query
            ->selectRaw(
                'COUNT(*) as orders'
            )
            ->selectRaw(
                'COALESCE(SUM(total), 0) as revenue'
            )
            ->selectRaw(
                'COALESCE(AVG(total), 0) as average_order_value'
            )
            ->first();

        return [
            'orders' =>
                (int) $result->orders,

            'revenue' =>
                round(
                    (float) $result->revenue,
                    2
                ),

            'average_order_value' =>
                round(
                    (float)
                        $result
                            ->average_order_value,
                    2
                ),
        ];
    }

    private function revenueTrend(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        $dateExpression =
            'DATE(COALESCE(pos_created_at, created_at))';

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
                [$start, $end]
            )
            ->selectRaw(
                "{$dateExpression} as date"
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
            ->map(fn ($row) => [
                'date' => $row->date,

                'orders' =>
                    (int) $row->orders,

                'revenue' =>
                    round(
                        (float) $row->revenue,
                        2
                    ),
            ])
            ->values()
            ->all();
    }

    private function weekdayDemand(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        $dateExpression =
            'COALESCE(pos_created_at, created_at)';

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
                DB::raw($dateExpression),
                [$start, $end]
            )
            ->selectRaw(
                "DAYNAME({$dateExpression}) as day"
            )
            ->selectRaw(
                'COUNT(*) as orders'
            )
            ->selectRaw(
                'ROUND(SUM(total), 2) as revenue'
            )
            ->groupByRaw(
                "WEEKDAY({$dateExpression}),
                DAYNAME({$dateExpression})"
            )
            ->orderByRaw(
                "WEEKDAY({$dateExpression})"
            )
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,

                'orders' =>
                    (int) $row->orders,

                'revenue' =>
                    round(
                        (float) $row->revenue,
                        2
                    ),
            ])
            ->values()
            ->all();
    }

    private function products(
        int $restaurantId,
        Carbon $start,
        Carbon $end,
        string $direction
    ): array {
        $query = DB::table('order_items')
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
                [$start, $end]
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
            );

        if ($direction === 'asc') {
            $query
                ->orderBy('quantity')
                ->orderBy('revenue');
        } else {
            $query
                ->orderByDesc('quantity')
                ->orderByDesc('revenue');
        }

        return $query
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'name' =>
                    $item->item_name,

                'quantity' =>
                    round(
                        (float)
                            $item->quantity,
                        3
                    ),

                'revenue' =>
                    round(
                        (float)
                            $item->revenue,
                        2
                    ),
            ])
            ->values()
            ->all();
    }

    private function orderStatuses(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        return $this
            ->ordersForPeriod(
                $restaurantId,
                $start,
                $end
            )
            ->select(
                'status'
            )
            ->selectRaw(
                'COUNT(*) as orders'
            )
            ->groupBy('status')
            ->get()
            ->mapWithKeys(
                fn ($row) => [
                    $row->status =>
                        (int) $row->orders,
                ]
            )
            ->all();
    }

    private function paymentMethods(
        int $restaurantId,
        Carbon $start,
        Carbon $end
    ): array {
        return $this
            ->ordersForPeriod(
                $restaurantId,
                $start,
                $end
            )
            ->where(
                'payment_status',
                'paid'
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
            ->orderByDesc('orders')
            ->get()
            ->map(fn ($row) => [
                'payment_method' =>
                    $row->payment_method,

                'orders' =>
                    (int) $row->orders,

                'revenue' =>
                    round(
                        (float) $row->revenue,
                        2
                    ),
            ])
            ->values()
            ->all();
    }

    private function percentageChange(
        float|int $previous,
        float|int $current
    ): float {
        $previous = (float) $previous;
        $current = (float) $current;

        if ($previous === 0.0) {
            return $current > 0
                ? 100.0
                : 0.0;
        }

        return round(
            (
                ($current - $previous)
                / $previous
            ) * 100,
            1
        );
    }
}