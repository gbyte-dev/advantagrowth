<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'subscription_payments',
            function (Blueprint $table) {
                $table->id();

                $table
                    ->foreignId('restaurant_id')
                    ->constrained('restaurants')
                    ->cascadeOnDelete();

                $table
                    ->foreignId('subscription_id')
                    ->constrained('subscriptions')
                    ->restrictOnDelete();

                /*
                | Payment is created before subscription
                | activation, so this is initially NULL.
                */
                $table
                    ->foreignId(
                        'restaurant_subscription_id'
                    )
                    ->nullable()
                    ->constrained(
                        'restaurant_subscriptions'
                    )
                    ->nullOnDelete();

                $table
                    ->string('provider', 50)
                    ->default('razorpay');

                /*
                | Internal unique payment receipt.
                */
                $table
                    ->string('receipt', 100)
                    ->unique();

                $table
                    ->string(
                        'provider_order_id',
                        191
                    )
                    ->unique();

                $table
                    ->string(
                        'provider_payment_id',
                        191
                    )
                    ->nullable()
                    ->unique();

                /*
                | Razorpay uses the smallest currency
                | unit, such as paise/cents.
                */
                $table
                    ->unsignedBigInteger(
                        'amount_minor'
                    );

                $table
                    ->decimal(
                        'amount',
                        12,
                        2
                    );

                $table
                    ->string('currency', 3);

                $table
                    ->string('status', 30)
                    ->default('pending');

                $table
                    ->string(
                        'payment_method',
                        50
                    )
                    ->nullable();

                $table
                    ->timestamp('verified_at')
                    ->nullable();

                $table
                    ->timestamp('paid_at')
                    ->nullable();

                $table
                    ->timestamp('failed_at')
                    ->nullable();

                $table
                    ->text('failure_reason')
                    ->nullable();

                $table
                    ->json('provider_payload')
                    ->nullable();

                $table->timestamps();

                $table->index(
                    [
                        'restaurant_id',
                        'status',
                    ],
                    'sub_payments_restaurant_status_idx'
                );

                $table->index(
                    [
                        'subscription_id',
                        'status',
                    ],
                    'sub_payments_plan_status_idx'
                );

                $table->index(
                    'paid_at',
                    'sub_payments_paid_at_idx'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'subscription_payments'
        );
    }
};