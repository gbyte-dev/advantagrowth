<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            Schema::hasTable('orders') &&
            !Schema::hasColumn(
                'orders',
                'delivery_address'
            )
        ) {
            Schema::table(
                'orders',
                function (Blueprint $table) {
                    /*
                     * Do not use ->after('customer_email').
                     *
                     * On a fresh database customer_email may not
                     * exist yet when this migration runs.
                     */
                    $table->text(
                        'delivery_address'
                    )->nullable();
                }
            );
        }
    }

    public function down(): void
    {
        if (
            Schema::hasTable('orders') &&
            Schema::hasColumn(
                'orders',
                'delivery_address'
            )
        ) {
            Schema::table(
                'orders',
                function (Blueprint $table) {
                    $table->dropColumn(
                        'delivery_address'
                    );
                }
            );
        }
    }
};