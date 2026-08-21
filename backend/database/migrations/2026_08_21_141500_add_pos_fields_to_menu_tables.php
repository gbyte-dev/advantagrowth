<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->foreignId('pos_connection_id')
                ->nullable()
                ->after('restaurant_id')
                ->constrained('pos_connections')
                ->nullOnDelete();

            $table->string(
                'external_category_id',
                191
            )
                ->nullable()
                ->after('pos_connection_id');

            $table->unique(
                [
                    'pos_connection_id',
                    'external_category_id',
                ],
                'menu_categories_pos_external_unique'
            );
        });

        Schema::table('menu_items', function (Blueprint $table) {
            $table->foreignId('pos_connection_id')
                ->nullable()
                ->after('restaurant_id')
                ->constrained('pos_connections')
                ->nullOnDelete();

            $table->string(
                'external_item_id',
                191
            )
                ->nullable()
                ->after('pos_connection_id');

            $table->unique(
                [
                    'pos_connection_id',
                    'external_item_id',
                ],
                'menu_items_pos_external_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropUnique(
                'menu_items_pos_external_unique'
            );

            $table->dropConstrainedForeignId(
                'pos_connection_id'
            );

            $table->dropColumn(
                'external_item_id'
            );
        });

        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropUnique(
                'menu_categories_pos_external_unique'
            );

            $table->dropConstrainedForeignId(
                'pos_connection_id'
            );

            $table->dropColumn(
                'external_category_id'
            );
        });
    }
};
