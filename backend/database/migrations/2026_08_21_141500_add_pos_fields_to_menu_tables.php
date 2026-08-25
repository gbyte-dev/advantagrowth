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
        | MENU CATEGORIES
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('menu_categories')) {

            if (!Schema::hasColumn('menu_categories', 'pos_connection_id')) {
                Schema::table('menu_categories', function (Blueprint $table) {
                    $table->foreignId('pos_connection_id')
                        ->nullable()
                        ->after('restaurant_id')
                        ->constrained('pos_connections')
                        ->nullOnDelete();
                });
            }

            if (!Schema::hasColumn('menu_categories', 'external_category_id')) {
                Schema::table('menu_categories', function (Blueprint $table) {
                    $table->string(
                        'external_category_id',
                        191
                    )
                        ->nullable()
                        ->after('pos_connection_id');
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | MENU ITEMS
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('menu_items')) {

            if (!Schema::hasColumn('menu_items', 'pos_connection_id')) {
                Schema::table('menu_items', function (Blueprint $table) {
                    $table->foreignId('pos_connection_id')
                        ->nullable()
                        ->after('restaurant_id')
                        ->constrained('pos_connections')
                        ->nullOnDelete();
                });
            }

            if (!Schema::hasColumn('menu_items', 'external_item_id')) {
                Schema::table('menu_items', function (Blueprint $table) {
                    $table->string(
                        'external_item_id',
                        191
                    )
                        ->nullable()
                        ->after('pos_connection_id');
                });
            }
        }
    }

    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | MENU ITEMS
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('menu_items')) {

            if (Schema::hasColumn('menu_items', 'pos_connection_id')) {
                Schema::table('menu_items', function (Blueprint $table) {
                    $table->dropConstrainedForeignId(
                        'pos_connection_id'
                    );
                });
            }

            if (Schema::hasColumn('menu_items', 'external_item_id')) {
                Schema::table('menu_items', function (Blueprint $table) {
                    $table->dropColumn(
                        'external_item_id'
                    );
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | MENU CATEGORIES
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('menu_categories')) {

            if (Schema::hasColumn('menu_categories', 'pos_connection_id')) {
                Schema::table('menu_categories', function (Blueprint $table) {
                    $table->dropConstrainedForeignId(
                        'pos_connection_id'
                    );
                });
            }

            if (Schema::hasColumn('menu_categories', 'external_category_id')) {
                Schema::table('menu_categories', function (Blueprint $table) {
                    $table->dropColumn(
                        'external_category_id'
                    );
                });
            }
        }
    }
};