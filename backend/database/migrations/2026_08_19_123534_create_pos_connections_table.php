<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_connections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | POS Provider
            |--------------------------------------------------------------------------
            |
            | Examples:
            | square
            | toast
            | clover
            | lightspeed
            | restolution
            | custom
            |
            */

            $table->string('provider', 50);

            /*
            |--------------------------------------------------------------------------
            | Friendly Connection Name
            |--------------------------------------------------------------------------
            |
            | Example:
            | Main Restaurant POS
            | Downtown Branch POS
            |
            */

            $table->string('label');

            /*
            |--------------------------------------------------------------------------
            | Credentials
            |--------------------------------------------------------------------------
            |
            | These will be encrypted by the Laravel model later.
            |
            | TEXT is intentionally used because encrypted values
            | can be much longer than the original credential.
            |
            */

            $table->text('api_key')->nullable();
            $table->text('access_token')->nullable();

            /*
            |--------------------------------------------------------------------------
            | POS API Base URL
            |--------------------------------------------------------------------------
            */

            $table->string('base_url', 500)->nullable();

            /*
            |--------------------------------------------------------------------------
            | External POS Merchant / Business ID
            |--------------------------------------------------------------------------
            |
            | Filled automatically after testing/fetching POS details.
            |
            */

            $table->string('external_merchant_id')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Connection Status
            |--------------------------------------------------------------------------
            |
            | disconnected
            | connected
            | syncing
            | error
            |
            */

            $table->string('status', 30)
                ->default('disconnected');

            /*
            |--------------------------------------------------------------------------
            | Error Information
            |--------------------------------------------------------------------------
            */

            $table->text('last_error')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Activity
            |--------------------------------------------------------------------------
            */

            $table->timestamp('last_connected_at')->nullable();
            $table->timestamp('last_synced_at')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'restaurant_id',
                'provider',
            ]);

            $table->index([
                'restaurant_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_connections');
    }
};
