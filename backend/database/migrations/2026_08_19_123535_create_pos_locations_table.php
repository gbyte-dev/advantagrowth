<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    if (Schema::hasTable('pos_locations')) {
        return;
    }

    Schema::create('pos_locations', function (Blueprint $table) {
        $table->id();

        $table->foreignId('pos_connection_id')
            ->constrained('pos_connections')
            ->cascadeOnDelete();

        $table->foreignId('restaurant_id')
            ->constrained('restaurants')
            ->cascadeOnDelete();

        $table->string('external_location_id')->nullable();
        $table->string('external_business_id')->nullable();

        $table->string('name')->nullable();
        $table->string('legal_name')->nullable();

        $table->string('phone', 50)->nullable();
        $table->string('email')->nullable();

        $table->string('address_line_1')->nullable();
        $table->string('address_line_2')->nullable();
        $table->string('city')->nullable();
        $table->string('postal_code', 50)->nullable();
        $table->string('country', 100)->nullable();

        $table->string('currency', 20)->nullable();
        $table->string('timezone', 100)->nullable();

        $table->json('raw_data')->nullable();

        $table->timestamp('last_fetched_at')->nullable();

        $table->boolean('is_active')->default(true);

        $table->timestamps();
    });
}
    public function down(): void
    {
        Schema::dropIfExists('pos_locations');
    }
};
