<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'recommendation_feedback',
            function (
                Blueprint $table
            ) {
                $table->id();

                $table
                    ->foreignId(
                        'restaurant_id'
                    )
                    ->constrained(
                        'restaurants'
                    )
                    ->cascadeOnDelete();

                $table
                    ->foreignId(
                        'recommendation_id'
                    )
                    ->constrained(
                        'recommendations'
                    )
                    ->cascadeOnDelete();

                $table
                    ->foreignId(
                        'user_id'
                    )
                    ->constrained(
                        'users'
                    )
                    ->cascadeOnDelete();

                $table
                    ->string(
                        'feedback',
                        20
                    );

                $table->timestamps();

                /*
                 * One user can have only one response
                 * for each recommendation.
                 *
                 * The existing response can be updated
                 * from Useful to Not Useful or vice versa.
                 */

                $table->unique(
                    [
                        'recommendation_id',
                        'user_id',
                    ],
                    'recommendation_feedback_unique'
                );

                $table->index(
                    [
                        'restaurant_id',
                        'feedback',
                    ],
                    'recommendation_feedback_restaurant_index'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'recommendation_feedback'
        );
    }
};