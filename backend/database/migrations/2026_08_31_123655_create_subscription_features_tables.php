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
        | Dynamic feature master
        |--------------------------------------------------------------------------
        */

        Schema::create(
            'subscription_features',
            function (Blueprint $table) {
                $table->id();

                $table
                    ->string('key', 100)
                    ->unique();

                $table->string('name');

                $table
                    ->text('description')
                    ->nullable();

                $table
                    ->string('value_type')
                    ->default('boolean');

                $table
                    ->string('unit', 50)
                    ->nullable();

                $table
                    ->unsignedInteger('sort_order')
                    ->default(0);

                $table
                    ->boolean('is_active')
                    ->default(true);

                $table->timestamps();

                $table->index([
                    'is_active',
                    'sort_order',
                ]);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Feature configuration for each plan
        |--------------------------------------------------------------------------
        */

        Schema::create(
            'subscription_plan_features',
            function (Blueprint $table) {
                $table->id();

                $table
                    ->foreignId('subscription_id')
                    ->constrained('subscriptions')
                    ->cascadeOnDelete();

                $table
                    ->foreignId(
                        'subscription_feature_id'
                    )
                    ->constrained(
                        'subscription_features'
                    )
                    ->restrictOnDelete();

                $table
                    ->boolean('is_enabled')
                    ->default(true);

                /*
                | NULL means unlimited.
                | Used only for limit-type features.
                */
                $table
                    ->unsignedInteger('limit_value')
                    ->nullable();

                $table->timestamps();

                $table->unique(
                    [
                        'subscription_id',
                        'subscription_feature_id',
                    ],
                    'subscription_plan_feature_unique'
                );

                $table->index(
                [
                    'subscription_feature_id',
                    'is_enabled',
                ],
                'spf_feature_enabled_idx'
            );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'subscription_plan_features'
        );

        Schema::dropIfExists(
            'subscription_features'
        );
    }
};