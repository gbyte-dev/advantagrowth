<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->foreignId('pos_connection_id')
                ->nullable()
                ->constrained('pos_connections')
                ->nullOnDelete();

            $table->string('external_payment_id', 191)
                ->nullable();

            $table->string('payment_method', 100)
                ->nullable();

            $table->string('card_type', 100)
                ->nullable();

            $table->decimal('amount', 10, 2)
                ->default(0);

            $table->decimal('tip_amount', 10, 2)
                ->default(0);

            $table->string('status', 50)
                ->default('paid');

            $table->timestamp('paid_at')
                ->nullable();

            $table->json('raw_pos_data')
                ->nullable();

            $table->timestamps();

            $table->unique(
                [
                    'pos_connection_id',
                    'external_payment_id',
                ],
                'pos_payments_connection_external_unique'
            );

            $table->index(
                ['restaurant_id', 'order_id'],
                'pos_payments_restaurant_order_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_payments');
    }
};
