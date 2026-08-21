<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('pos_connection_id')
                ->nullable()
                ->constrained('pos_connections')
                ->nullOnDelete();

            $table->string('source', 50)
                ->default('website');

            $table->string('external_order_id', 191)
                ->nullable();

            $table->string('external_location_id', 191)
                ->nullable();

            $table->string('order_type', 50)
                ->nullable();

            $table->string('table_number', 100)
                ->nullable();

            $table->decimal('tax_amount', 10, 2)
                ->default(0);

            $table->decimal('tip_amount', 10, 2)
                ->default(0);

            $table->json('raw_pos_data')
                ->nullable();

            $table->timestamp('pos_created_at')
                ->nullable();

            $table->timestamp('pos_updated_at')
                ->nullable();

            $table->unique(
                [
                    'pos_connection_id',
                    'external_order_id',
                ],
                'orders_pos_connection_external_order_unique'
            );

            $table->index(
                [
                    'restaurant_id',
                    'source',
                ],
                'orders_restaurant_source_index'
            );

            $table->index(
                'external_location_id',
                'orders_external_location_index'
            );
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('menu_item_id')
                ->nullable()
                ->change();

            $table->string('external_item_id', 191)
                ->nullable();

            $table->string('external_menu_item_id', 191)
                ->nullable();

            $table->json('modifiers')
                ->nullable();

            $table->json('raw_pos_data')
                ->nullable();

            $table->index(
                'external_item_id',
                'order_items_external_item_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(
                'order_items_external_item_index'
            );

            $table->dropColumn([
                'external_item_id',
                'external_menu_item_id',
                'modifiers',
                'raw_pos_data',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(
                'orders_pos_connection_external_order_unique'
            );

            $table->dropIndex(
                'orders_restaurant_source_index'
            );

            $table->dropIndex(
                'orders_external_location_index'
            );

            $table->dropConstrainedForeignId(
                'pos_connection_id'
            );

            $table->dropColumn([
                'source',
                'external_order_id',
                'external_location_id',
                'order_type',
                'table_number',
                'tax_amount',
                'tip_amount',
                'raw_pos_data',
                'pos_created_at',
                'pos_updated_at',
            ]);
        });
    }
};