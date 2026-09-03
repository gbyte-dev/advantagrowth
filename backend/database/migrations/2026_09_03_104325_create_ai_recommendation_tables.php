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
        | AI generation runs
        |--------------------------------------------------------------------------
        */

        Schema::create(
            'recommendation_generations',
            function (Blueprint $table) {
                $table->id();

                $table
                    ->foreignId('restaurant_id')
                    ->constrained('restaurants')
                    ->cascadeOnDelete();

                $table
                    ->string('status', 20)
                    ->default('pending');

                $table->date('period_start');
                $table->date('period_end');

                $table
                    ->string('model', 100)
                    ->nullable();

                $table
                    ->json('summary')
                    ->nullable();

                $table
                    ->json('analytics_snapshot')
                    ->nullable();

                $table
                    ->unsignedInteger('input_tokens')
                    ->nullable();

                $table
                    ->unsignedInteger('output_tokens')
                    ->nullable();

                $table
                    ->timestamp('generated_at')
                    ->nullable();

                $table
                    ->timestamp('failed_at')
                    ->nullable();

                $table
                    ->text('failure_reason')
                    ->nullable();

                $table->timestamps();

                $table->index(
                    [
                        'restaurant_id',
                        'status',
                    ],
                    'recommendation_generation_status_idx'
                );

                $table->index(
                    [
                        'restaurant_id',
                        'generated_at',
                    ],
                    'recommendation_generation_date_idx'
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Generated recommendation cards
        |--------------------------------------------------------------------------
        */

        Schema::create(
            'recommendations',
            function (Blueprint $table) {
                $table->id();

                $table
                    ->foreignId(
                        'recommendation_generation_id'
                    )
                    ->constrained(
                        'recommendation_generations'
                    )
                    ->cascadeOnDelete();

                $table
                    ->foreignId('restaurant_id')
                    ->constrained('restaurants')
                    ->cascadeOnDelete();

                $table->string('category', 50);
                $table->string('priority', 20);

                $table
                    ->unsignedTinyInteger(
                        'confidence'
                    );

                $table->string('title');
                $table->text('description');
                $table->text('problem');
                $table->text('solution');

                $table
                    ->text('expected_impact')
                    ->nullable();

                $table
                    ->string('status', 20)
                    ->default('active');

                $table->timestamps();

                $table->index(
                    [
                        'restaurant_id',
                        'status',
                    ],
                    'recommendation_restaurant_status_idx'
                );

                $table->index(
                    [
                        'recommendation_generation_id',
                        'priority',
                    ],
                    'recommendation_generation_priority_idx'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'recommendations'
        );

        Schema::dropIfExists(
            'recommendation_generations'
        );
    }
};