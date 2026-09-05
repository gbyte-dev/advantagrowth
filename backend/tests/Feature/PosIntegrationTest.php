<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\PosConnection;
use App\Models\PosPayment;
use App\Models\Restaurant;
use App\Models\RestaurantSubscription;
use App\Models\Subscription;
use App\Models\User;
use App\Services\POS\PosOrderSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PosIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private function createRestaurantOwner(): array
    {
        $restaurant = Restaurant::create([
            'name' => 'Test Restaurant',
            'slug' => 'test-restaurant',
            'phone' => '9999999999',
            'email' => 'restaurant@example.com',
            'currency' => 'INR',
            'timezone' => 'Asia/Kolkata',
            'is_active' => true,
        ]);

        $user = User::create([
            'restaurant_id' => $restaurant->id,
            'owner_name' => 'Test Owner',
            'email' => 'owner@example.com',
            'phone' => '9999999998',
            'password' => bcrypt('password123'),
        ]);

        return [$restaurant, $user];
    }

    private function createConnection(
        Restaurant $restaurant
    ): PosConnection {
        return PosConnection::create([
            'restaurant_id' => $restaurant->id,
            'provider' => 'Custom API',
            'label' => 'Test POS',
            'base_url' => 'http://127.0.0.1:8000/api/mock-pos',
            'status' => 'connected',
            'external_merchant_id' => 'merchant_demo_001',
            'is_active' => true,
        ]);
    }

    private function normalizedOrder(
        string $externalOrderId = 'TEST-ORDER-1001',
        float $total = 33.80
    ): array {
        return [
            'external_order_id' => $externalOrderId,
            'external_location_id' => 'location_demo_001',
            'source' => 'custom_api',
            'order_type' => 'dine_in',
            'table_number' => 'T-01',
            'customer_name' => 'Test Customer',
            'customer_phone' => '8888888888',
            'customer_email' => 'customer@example.com',
            'delivery_address' => null,
            'subtotal' => 28.00,
            'tax_amount' => 2.80,
            'delivery_charge' => 0,
            'tip_amount' => 3.00,
            'total' => $total,
            'status' => 'completed',
            'payment_status' => 'paid',
            'payment_id' => 'TEST-PAY-1001',
            'payment_method' => 'card',
            'special_instructions' => null,
            'pos_created_at' => now()->subMinutes(10)->toIso8601String(),
            'pos_updated_at' => now()->toIso8601String(),

            'items' => [
                [
                    'external_item_id' => 'TEST-ITEM-1',
                    'external_menu_item_id' => 'TEST-MENU-1',
                    'item_name' => 'Test Item One',
                    'unit_price' => 14.00,
                    'quantity' => 1,
                    'total_price' => 14.00,
                    'modifiers' => [],
                    'raw_data' => [
                        'test' => true,
                    ],
                ],
                [
                    'external_item_id' => 'TEST-ITEM-2',
                    'external_menu_item_id' => 'TEST-MENU-2',
                    'item_name' => 'Test Item Two',
                    'unit_price' => 14.00,
                    'quantity' => 1,
                    'total_price' => 14.00,
                    'modifiers' => [],
                    'raw_data' => [
                        'test' => true,
                    ],
                ],
            ],

            'payments' => [
                [
                    'external_payment_id' => 'TEST-PAY-1001',
                    'type' => 'card',
                    'card_type' => 'VISA',
                    'amount' => $total,
                    'tip_amount' => 3.00,
                    'paid_at' => now()->toIso8601String(),
                    'raw_data' => [
                        'test' => true,
                    ],
                ],
            ],

            'raw_data' => [
                'test' => true,
            ],
        ];
    }

    public function test_pos_order_sync_creates_order_items_and_payment(): void
    {
        [$restaurant] =
            $this->createRestaurantOwner();

        $connection =
            $this->createConnection(
                $restaurant
            );

        $service =
            app(PosOrderSyncService::class);

        $result =
            $service->sync(
                $connection,
                [
                    $this->normalizedOrder(),
                ]
            );

        $this->assertSame(
            1,
            $result['processed']
        );

        $this->assertSame(
            1,
            $result['created']
        );

        $this->assertSame(
            0,
            $result['updated']
        );

        $this->assertSame(
            0,
            $result['failed']
        );

        $this->assertDatabaseCount(
            'orders',
            1
        );

        $this->assertDatabaseCount(
            'order_items',
            2
        );

        $this->assertDatabaseCount(
            'pos_payments',
            1
        );

        $this->assertDatabaseHas(
            'orders',
            [
                'external_order_id' =>
                    'TEST-ORDER-1001',

                'pos_connection_id' =>
                    $connection->id,

                'status' =>
                    'completed',

                'payment_status' =>
                    'paid',
            ]
        );

        $this->assertDatabaseHas(
            'pos_payments',
            [
                'external_payment_id' =>
                    'TEST-PAY-1001',

                'payment_method' =>
                    'card',
            ]
        );
    }

    public function test_second_pos_sync_updates_existing_order_without_duplicates(): void
    {
        [$restaurant] =
            $this->createRestaurantOwner();

        $connection =
            $this->createConnection(
                $restaurant
            );

        $service =
            app(PosOrderSyncService::class);

        $service->sync(
            $connection,
            [
                $this->normalizedOrder(),
            ]
        );

        $result =
            $service->sync(
                $connection,
                [
                    $this->normalizedOrder(
                        'TEST-ORDER-1001',
                        40.00
                    ),
                ]
            );

        $this->assertSame(
            0,
            $result['created']
        );

        $this->assertSame(
            1,
            $result['updated']
        );

        $this->assertDatabaseCount(
            'orders',
            1
        );

        $this->assertDatabaseCount(
            'order_items',
            2
        );

        $this->assertDatabaseCount(
            'pos_payments',
            1
        );

        $this->assertDatabaseHas(
            'orders',
            [
                'external_order_id' =>
                    'TEST-ORDER-1001',

                'total' =>
                    40.00,
            ]
        );
    }

    public function test_owner_orders_api_returns_pos_order_with_items_payments_and_connection(): void
    {
               [$restaurant, $user] =
            $this->createRestaurantOwner();

        $plan =
            Subscription::create([
                'name' =>
                    'POS Test Plan',

                'slug' =>
                    'pos-test-plan',

                'price' =>
                    0,

                'currency' =>
                    'INR',

                'interval' =>
                    'month',

                'interval_count' =>
                    1,

                'is_active' =>
                    true,

                'description' =>
                    'Plan used for POS API tests.',
            ]);

        RestaurantSubscription::create([
            'restaurant_id' =>
                $restaurant->id,

            'subscription_id' =>
                $plan->id,

            'status' =>
                'active',

            'starts_at' =>
                now()->subDay(),

            'expires_at' =>
                now()->addMonth(),

            'cancelled_at' =>
                null,

            'auto_renew' =>
                false,
        ]);

        $connection =
            $this->createConnection(
                $restaurant
            );

        $service =
            app(PosOrderSyncService::class);

        $service->sync(
            $connection,
            [
                $this->normalizedOrder(),
            ]
        );

        Sanctum::actingAs(
            $user
        );

        $response =
            $this->getJson(
                '/api/owner/orders'
            );

        $response
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonCount(
                1,
                'orders'
            )
            ->assertJsonPath(
                'orders.0.external_order_id',
                'TEST-ORDER-1001'
            )
            ->assertJsonPath(
                'orders.0.pos_connection.provider',
                'Custom API'
            )
            ->assertJsonCount(
                2,
                'orders.0.items'
            )
            ->assertJsonCount(
                1,
                'orders.0.pos_payments'
            );
    }
}
