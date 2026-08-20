<?php

namespace App\Services\POS;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosConnection;
use App\Models\PosPayment;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class PosOrderSyncService
{
    /**
     * Save normalized POS orders into local database.
     */
    public function sync(
        PosConnection $connection,
        array $orders
    ): array {
        $processed = 0;
        $created = 0;
        $updated = 0;
        $failed = 0;

        $itemsCreated = 0;
        $paymentsCreated = 0;

        $errors = [];

        foreach ($orders as $payload) {
            $processed++;

            try {
                if (!is_array($payload)) {
                    throw new RuntimeException(
                        'Normalized POS order payload is invalid.'
                    );
                }

                $externalOrderId =
                    $payload['external_order_id'] ?? null;

                if (!$externalOrderId) {
                    throw new RuntimeException(
                        'POS order external_order_id is missing.'
                    );
                }

                DB::transaction(
                    function () use (
                        $connection,
                        $payload,
                        $externalOrderId,
                        &$created,
                        &$updated,
                        &$itemsCreated,
                        &$paymentsCreated
                    ) {
                        /*
                        |--------------------------------------------------------------------------
                        | ORDER
                        |--------------------------------------------------------------------------
                        */

                        $order = Order::updateOrCreate(
                            [
                                'pos_connection_id' =>
                                    $connection->id,

                                'external_order_id' =>
                                    $externalOrderId,
                            ],
                            [
                                'restaurant_id' =>
                                    $connection->restaurant_id,

                                'source' =>
                                    $payload['source'] ??
                                    strtolower(
                                        $connection->provider
                                    ),

                                'external_location_id' =>
                                    $payload[
                                        'external_location_id'
                                    ] ?? null,

                                'order_type' =>
                                    $payload['order_type'] ?? null,

                                'table_number' =>
                                    $payload['table_number'] ?? null,

                                'customer_name' =>
                                    $payload['customer_name'] ??
                                    'POS Customer',

                                'customer_phone' =>
                                    $payload['customer_phone'] ??
                                    'N/A',

                                'customer_email' =>
                                    $payload['customer_email'] ?? null,

                                'delivery_address' =>
                                    $payload[
                                        'delivery_address'
                                    ] ?? null,

                                'subtotal' =>
                                    $payload['subtotal'] ?? 0,

                                'tax_amount' =>
                                    $payload['tax_amount'] ?? 0,

                                'delivery_charge' =>
                                    $payload[
                                        'delivery_charge'
                                    ] ?? 0,

                                'tip_amount' =>
                                    $payload['tip_amount'] ?? 0,

                                'total' =>
                                    $payload['total'] ?? 0,

                                'status' =>
                                    $payload['status'] ??
                                    'pending',

                                'payment_status' =>
                                    $payload[
                                        'payment_status'
                                    ] ?? 'pending',

                                'payment_id' =>
                                    $payload['payment_id'] ?? null,

                                'payment_method' =>
                                    $payload[
                                        'payment_method'
                                    ] ?? null,

                                'special_instructions' =>
                                    $payload[
                                        'special_instructions'
                                    ] ?? null,

                                'raw_pos_data' =>
                                    $payload['raw_data'] ?? null,

                                'pos_created_at' =>
                                    $payload[
                                        'pos_created_at'
                                    ] ?? null,

                                'pos_updated_at' =>
                                    $payload[
                                        'pos_updated_at'
                                    ] ?? null,
                            ]
                        );

                        if ($order->wasRecentlyCreated) {
                            $created++;
                        } else {
                            $updated++;
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | ORDER ITEMS
                        |--------------------------------------------------------------------------
                        |
                        | Rebuild current POS item snapshot on every sync.
                        |
                        */

                        OrderItem::where(
                            'order_id',
                            $order->id
                        )->delete();

                        $items =
                            $payload['items'] ?? [];

                        if (!is_array($items)) {
                            $items = [];
                        }

                        foreach ($items as $item) {
                            if (!is_array($item)) {
                                continue;
                            }

                            $quantity =
                                (int) round(
                                    (float)
                                    ($item['quantity'] ?? 1)
                                );

                            if ($quantity <= 0) {
                                $quantity = 1;
                            }

                            OrderItem::create([
                                'order_id' =>
                                    $order->id,

                                /*
                                 * External POS item may not yet
                                 * map to a local MenuItem.
                                 */
                                'menu_item_id' =>
                                    null,

                                'external_item_id' =>
                                    $item[
                                        'external_item_id'
                                    ] ?? null,

                                'external_menu_item_id' =>
                                    $item[
                                        'external_menu_item_id'
                                    ] ?? null,

                                'item_name' =>
                                    $item['item_name'] ??
                                    'POS Item',

                                'unit_price' =>
                                    $item['unit_price'] ?? 0,

                                'quantity' =>
                                    $quantity,

                                'total_price' =>
                                    $item[
                                        'total_price'
                                    ] ?? 0,

                                'modifiers' =>
                                    $item['modifiers'] ?? [],

                                'raw_pos_data' =>
                                    $item['raw_data'] ?? null,
                            ]);

                            $itemsCreated++;
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | POS PAYMENTS
                        |--------------------------------------------------------------------------
                        |
                        | Rebuild payment snapshot for this order.
                        |
                        | This supports:
                        | - single payment
                        | - split payments
                        | - multiple cards
                        | - cash + card combinations
                        | - per-payment tips
                        |
                        */

                        PosPayment::where(
                            'order_id',
                            $order->id
                        )->delete();

                        $payments =
                            $payload['payments'] ?? [];

                        if (!is_array($payments)) {
                            $payments = [];
                        }

                        foreach ($payments as $payment) {
                            if (!is_array($payment)) {
                                continue;
                            }

                            PosPayment::create([
                                'restaurant_id' =>
                                    $connection->restaurant_id,

                                'order_id' =>
                                    $order->id,

                                'pos_connection_id' =>
                                    $connection->id,

                                'external_payment_id' =>
                                    $payment[
                                        'external_payment_id'
                                    ] ?? null,

                                'payment_method' =>
                                    $payment['type'] ?? null,

                                'card_type' =>
                                    $payment['card_type'] ?? null,

                                'amount' =>
                                    $payment['amount'] ?? 0,

                                'tip_amount' =>
                                    $payment[
                                        'tip_amount'
                                    ] ?? 0,

                                'status' =>
                                    $payment['status'] ??
                                    'paid',

                                'paid_at' =>
                                    $payment['paid_at'] ?? null,

                                'raw_pos_data' =>
                                    $payment['raw_data'] ?? null,
                            ]);

                            $paymentsCreated++;
                        }
                    }
                );
            } catch (Throwable $exception) {
                report($exception);

                $failed++;

                $errors[] = [
                    'external_order_id' =>
                        is_array($payload)
                            ? (
                                $payload[
                                    'external_order_id'
                                ] ?? null
                            )
                            : null,

                    'message' =>
                        $exception->getMessage(),
                ];
            }
        }

        return [
            'processed' =>
                $processed,

            'created' =>
                $created,

            'updated' =>
                $updated,

            'failed' =>
                $failed,

            'items_created' =>
                $itemsCreated,

            'payments_created' =>
                $paymentsCreated,

            'errors' =>
                $errors,
        ];
    }
}