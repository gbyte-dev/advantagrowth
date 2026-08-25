<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ORDERS
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('orders')) {

            if (!Schema::hasColumn('orders', 'pos_connection_id')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->foreignId('pos_connection_id')
                        ->nullable()
                        ->constrained('pos_connections')
                        ->nullOnDelete();
                });
            }

            if (!Schema::hasColumn('orders', 'source')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('source', 50)
                        ->default('website');
                });
            }

            if (!Schema::hasColumn('orders', 'external_order_id')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('external_order_id', 191)
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'external_location_id')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('external_location_id', 191)
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'order_type')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('order_type', 50)
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'table_number')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('table_number', 100)
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'tax_amount')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->decimal('tax_amount', 10, 2)
                        ->default(0);
                });
            }

            if (!Schema::hasColumn('orders', 'tip_amount')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->decimal('tip_amount', 10, 2)
                        ->default(0);
                });
            }

            if (!Schema::hasColumn('orders', 'raw_pos_data')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->json('raw_pos_data')
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'pos_created_at')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->timestamp('pos_created_at')
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'pos_updated_at')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->timestamp('pos_updated_at')
                        ->nullable();
                });
            }

            /*
            |--------------------------------------------------------------------------
            | ORDERS INDEXES
            |--------------------------------------------------------------------------
            */

            if (
                Schema::hasColumn('orders', 'pos_connection_id') &&
                Schema::hasColumn('orders', 'external_order_id') &&
                !Schema::hasIndex(
                    'orders',
                    'orders_pos_connection_external_order_unique'
                )
            ) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->unique(
                        [
                            'pos_connection_id',
                            'external_order_id',
                        ],
                        'orders_pos_connection_external_order_unique'
                    );
                });
            }

            if (
                Schema::hasColumn('orders', 'restaurant_id') &&
                Schema::hasColumn('orders', 'source') &&
                !Schema::hasIndex(
                    'orders',
                    'orders_restaurant_source_index'
                )
            ) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->index(
                        [
                            'restaurant_id',
                            'source',
                        ],
                        'orders_restaurant_source_index'
                    );
                });
            }

            if (
                Schema::hasColumn('orders', 'external_location_id') &&
                !Schema::hasIndex(
                    'orders',
                    'orders_external_location_index'
                )
            ) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->index(
                        'external_location_id',
                        'orders_external_location_index'
                    );
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('order_items')) {

            /*
             * POS order items may not map to a local menu item.
             */
            if (Schema::hasColumn('order_items', 'menu_item_id')) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->foreignId('menu_item_id')
                        ->nullable()
                        ->change();
                });
            }

            if (!Schema::hasColumn('order_items', 'external_item_id')) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->string('external_item_id', 191)
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('order_items', 'external_menu_item_id')) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->string('external_menu_item_id', 191)
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('order_items', 'modifiers')) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->json('modifiers')
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('order_items', 'raw_pos_data')) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->json('raw_pos_data')
                        ->nullable();
                });
            }

            if (
                Schema::hasColumn('order_items', 'external_item_id') &&
                !Schema::hasIndex(
                    'order_items',
                    'order_items_external_item_index'
                )
            ) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->index(
                        'external_item_id',
                        'order_items_external_item_index'
                    );
                });
            }
        }
    }

    public function down(): void
    {
        /*
         * Conservative rollback because this migration
         * may run against legacy/partially migrated databases.
         */
    }
};