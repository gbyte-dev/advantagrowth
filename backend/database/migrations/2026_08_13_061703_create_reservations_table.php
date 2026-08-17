<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // Restaurant
            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            // Customer details
            $table->string('customer_name');
            $table->string('phone', 20);
            $table->string('email');

            // Reservation details
            $table->unsignedInteger('guests');
            $table->date('reservation_date');
            $table->time('reservation_time');

            // Optional message
            $table->text('special_requests')->nullable();

            // pending / confirmed / cancelled
            $table->string('status')->default('pending');

            $table->timestamps();

            // Faster reservation searches
            $table->index([
                'restaurant_id',
                'reservation_date',
                'reservation_time',
            ]);

            $table->index([
                'restaurant_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};