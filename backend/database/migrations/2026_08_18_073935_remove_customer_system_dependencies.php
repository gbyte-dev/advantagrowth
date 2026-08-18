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
        | Remove customer account dependency.
        |
        | customer_name, customer_phone and customer_email are intentionally
        | kept as order snapshot/customer information.
        */

        if (Schema::hasTable('orders')) {

            // Remove customer foreign key if it exists.
            if (Schema::hasColumn('orders', 'customer_id')) {

                $foreignKeys = collect(
                    Schema::getForeignKeys('orders')
                );

                $customerForeignKey = $foreignKeys->first(
                    fn ($foreignKey) =>
                        in_array('customer_id', $foreignKey['columns'] ?? [])
                );

                if ($customerForeignKey) {
                    Schema::table('orders', function (Blueprint $table) {
                        $table->dropForeign(['customer_id']);
                    });
                }

                // Drop customer_id index if it exists.
                $indexes = collect(
                    Schema::getIndexes('orders')
                );

                $customerIndex = $indexes->first(
                    fn ($index) =>
                        in_array('customer_id', $index['columns'] ?? [])
                        && ($index['name'] ?? '') !== 'PRIMARY'
                );

                if ($customerIndex) {
                    Schema::table('orders', function (Blueprint $table) use ($customerIndex) {
                        $table->dropIndex($customerIndex['name']);
                    });
                }

                // Finally remove customer_id.
                if (Schema::hasColumn('orders', 'customer_id')) {
                    Schema::table('orders', function (Blueprint $table) {
                        $table->dropColumn('customer_id');
                    });
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | REVIEWS
        |--------------------------------------------------------------------------
        | Reviews no longer depend on customer accounts.
        */

        if (Schema::hasTable('reviews')) {

            if (Schema::hasColumn('reviews', 'customer_id')) {

                $foreignKeys = collect(
                    Schema::getForeignKeys('reviews')
                );

                $customerForeignKey = $foreignKeys->first(
                    fn ($foreignKey) =>
                        in_array('customer_id', $foreignKey['columns'] ?? [])
                );

                if ($customerForeignKey) {
                    Schema::table('reviews', function (Blueprint $table) {
                        $table->dropForeign(['customer_id']);
                    });
                }

                // Drop customer_id index if it exists.
                $indexes = collect(
                    Schema::getIndexes('reviews')
                );

                $customerIndex = $indexes->first(
                    fn ($index) =>
                        in_array('customer_id', $index['columns'] ?? [])
                        && ($index['name'] ?? '') !== 'PRIMARY'
                );

                if ($customerIndex) {
                    Schema::table('reviews', function (Blueprint $table) use ($customerIndex) {
                        $table->dropIndex($customerIndex['name']);
                    });
                }

                // Finally remove customer_id.
                if (Schema::hasColumn('reviews', 'customer_id')) {
                    Schema::table('reviews', function (Blueprint $table) {
                        $table->dropColumn('customer_id');
                    });
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | CUSTOMERS TABLE
        |--------------------------------------------------------------------------
        */

        Schema::dropIfExists('customers');
    }


    public function down(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Intentionally irreversible
        |--------------------------------------------------------------------------
        | Customer account authentication has been removed from the
        | current POS architecture.
        */
    }
};