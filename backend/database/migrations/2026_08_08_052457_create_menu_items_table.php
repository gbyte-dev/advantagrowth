<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            $table->foreignId('menu_category_id')
                ->constrained('menu_categories')
                ->cascadeOnDelete();

            $table->string('name');

            $table->text('description')->nullable();

            $table->decimal('price', 10, 2);

            $table->string('image')->nullable();

            $table->enum('food_type', [
                'veg',
                'non_veg',
                'egg'
            ])->default('veg');

            $table->boolean('is_available')->default(true);

            $table->boolean('is_active')->default(true);

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index([
                'restaurant_id',
                'is_active',
                'is_available'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};