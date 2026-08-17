<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_marquee_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            $table->string('text');

            $table->unsignedInteger('sort_order')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Short index name to stay within MySQL's 64-character limit.
            $table->index(
                ['restaurant_id', 'is_active', 'sort_order'],
                'marquee_restaurant_active_sort'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_marquee_items');
    }
};