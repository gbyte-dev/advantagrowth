<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sup_admin_restaurents', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('location');

            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            $table->string('category');

            $table->boolean('dine_in')->default(true);
            $table->boolean('takeaway')->default(false);
            $table->boolean('delivery')->default(false);
            $table->boolean('reservation_available')->default(false);

            $table->time('opening_time');
            $table->time('closing_time');

            $table->string('currency')->default('INR');
            $table->string('timezone')->default('Asia/Kolkata');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sup_admin_restaurents');
    }
};
