<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {

            $table->id();

            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('rating');

            $table->text('review')->nullable();

            $table->boolean('is_visible')->default(true);

            $table->timestamps();

            $table->index([
                'restaurant_id',
                'rating',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};