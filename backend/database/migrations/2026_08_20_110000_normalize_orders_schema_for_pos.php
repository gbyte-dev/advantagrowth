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
            if (!Schema::hasColumn('orders', 'customer_name')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('customer_name')
                        ->default('POS Customer');
                });
            }

            if (!Schema::hasColumn('orders', 'customer_phone')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('customer_phone')
                        ->default('N/A');
                });
            }

            if (!Schema::hasColumn('orders', 'customer_email')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('customer_email')
                        ->nullable();
                });
            }

            if (!Schema::hasColumn('orders', 'delivery_charge')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->decimal(
                        'delivery_charge',
                        10,
                        2
                    )->default(0);
                });
            }

            if (!Schema::hasColumn('orders', 'payment_id')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('payment_id')
                        ->nullable();
                });
            }

            /*
             * POS orders use external_order_id and do not necessarily
             * have a website-style order_number.
             */
            if (Schema::hasColumn('orders', 'order_number')) {
                Schema::table('orders', function (Blueprint $table) {
                    $table->string('order_number')
                        ->nullable()
                        ->change();
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        if (Schema::hasTable('order_items')) {
            if (
                Schema::hasColumn('order_items', 'price') &&
                !Schema::hasColumn('order_items', 'unit_price')
            ) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->renameColumn(
                        'price',
                        'unit_price'
                    );
                });
            }

            if (
                Schema::hasColumn('order_items', 'subtotal') &&
                !Schema::hasColumn('order_items', 'total_price')
            ) {
                Schema::table('order_items', function (Blueprint $table) {
                    $table->renameColumn(
                        'subtotal',
                        'total_price'
                    );
                });
            }
        }
    }

    public function down(): void
    {
        /*
         * Intentionally left conservative.
         * This migration normalizes legacy schema for the current app.
         */
    }
};
