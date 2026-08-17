<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_stories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('label')->default('Our Story');

            $table->string('years')->nullable();

            $table->string('main_image')->nullable();

            $table->string('secondary_image')->nullable();

            $table->string('title');

            $table->text('description')->nullable();

            $table->string('feature_1_title')->nullable();
            $table->text('feature_1_description')->nullable();
            $table->string('feature_1_icon')->nullable();

            $table->string('feature_2_title')->nullable();
            $table->text('feature_2_description')->nullable();
            $table->string('feature_2_icon')->nullable();

            $table->string('feature_3_title')->nullable();
            $table->text('feature_3_description')->nullable();
            $table->string('feature_3_icon')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_stories');
    }
};