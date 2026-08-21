<?php

namespace Tests\Feature;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\PosConnection;
use App\Models\Restaurant;
use App\Services\POS\PosMenuSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosMenuSyncTest extends TestCase
{
    use RefreshDatabase;

    private function createConnection(): PosConnection
    {
        $restaurant = Restaurant::create([
            'name' => 'Menu Sync Restaurant',
            'slug' => 'menu-sync-restaurant',
            'phone' => '9999999999',
            'email' => 'menu-sync@example.com',
            'is_active' => true,
        ]);

        return PosConnection::create([
            'restaurant_id' => $restaurant->id,
            'provider' => 'Custom API',
            'label' => 'Menu Test POS',
            'base_url' => 'http://127.0.0.1:8001/api/mock-pos',
            'status' => 'connected',
            'is_active' => true,
        ]);
    }

    private function menuPayload(
        string $itemName = 'Chicken Tikka Masala',
        float $price = 14.00
    ): array {
        return [
            [
                'external_category_id' => 'CAT-001',
                'name' => 'Main Course',
                'description' => 'Popular main course dishes.',
                'sort_order' => 1,
                'is_active' => true,

                'items' => [
                    [
                        'external_item_id' => 'MENU-101',
                        'name' => $itemName,
                        'description' => 'Creamy chicken tikka curry.',
                        'price' => $price,
                        'food_type' => 'non-veg',
                        'is_available' => true,
                        'is_active' => true,
                        'sort_order' => 1,
                    ],
                ],
            ],
        ];
    }

    public function test_pos_menu_sync_creates_category_and_item(): void
    {
        $connection = $this->createConnection();

        $service = app(
            PosMenuSyncService::class
        );

        $result = $service->sync(
            $connection,
            $this->menuPayload()
        );

        $this->assertSame(
            1,
            $result['categories_processed']
        );

        $this->assertSame(
            1,
            $result['categories_created']
        );

        $this->assertSame(
            1,
            $result['items_processed']
        );

        $this->assertSame(
            1,
            $result['items_created']
        );

        $this->assertDatabaseHas(
            'menu_categories',
            [
                'restaurant_id' =>
                    $connection->restaurant_id,

                'pos_connection_id' =>
                    $connection->id,

                'external_category_id' =>
                    'CAT-001',

                'name' =>
                    'Main Course',
            ]
        );

        $this->assertDatabaseHas(
            'menu_items',
            [
                'restaurant_id' =>
                    $connection->restaurant_id,

                'pos_connection_id' =>
                    $connection->id,

                'external_item_id' =>
                    'MENU-101',

                'name' =>
                    'Chicken Tikka Masala',

                'food_type' =>
                    'non_veg',
            ]
        );
    }

    public function test_second_menu_sync_updates_without_duplicates(): void
    {
        $connection = $this->createConnection();

        $service = app(
            PosMenuSyncService::class
        );

        $service->sync(
            $connection,
            $this->menuPayload()
        );

        $result = $service->sync(
            $connection,
            $this->menuPayload(
                'Chicken Tikka Masala Updated',
                15.50
            )
        );

        $this->assertSame(
            0,
            $result['categories_created']
        );

        $this->assertSame(
            1,
            $result['categories_updated']
        );

        $this->assertSame(
            0,
            $result['items_created']
        );

        $this->assertSame(
            1,
            $result['items_updated']
        );

        $this->assertSame(
            1,
            MenuCategory::where(
                'pos_connection_id',
                $connection->id
            )->count()
        );

        $this->assertSame(
            1,
            MenuItem::where(
                'pos_connection_id',
                $connection->id
            )->count()
        );

        $this->assertDatabaseHas(
            'menu_items',
            [
                'pos_connection_id' =>
                    $connection->id,

                'external_item_id' =>
                    'MENU-101',

                'name' =>
                    'Chicken Tikka Masala Updated',

                'price' =>
                    15.50,
            ]
        );
    }
}