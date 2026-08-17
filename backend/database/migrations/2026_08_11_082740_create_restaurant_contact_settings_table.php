<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_contact_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->unique()
                ->constrained('restaurants')
                ->cascadeOnDelete();

            $table->text('address')->nullable();

            $table->string('phone', 30)->nullable();

            $table->string('email')->nullable();

            $table->string('working_hours')->nullable();

            $table->string('facebook_url')->nullable();

            $table->string('instagram_url')->nullable();

            $table->string('twitter_url')->nullable();

            $table->string('youtube_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_contact_settings');
    }
};