<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_sync_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pos_connection_id')
                ->constrained('pos_connections')
                ->cascadeOnDelete();

            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Sync Type
            |--------------------------------------------------------------------------
            |
            | connection_test
            | restaurant
            | locations
            | menu
            | orders
            | payments
            | full
            |
            */

            $table->string('sync_type', 50);

            /*
            |--------------------------------------------------------------------------
            | Sync Status
            |--------------------------------------------------------------------------
            |
            | pending
            | running
            | success
            | failed
            |
            */

            $table->string('status', 30)
                ->default('pending');

            /*
            |--------------------------------------------------------------------------
            | Record Counts
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('records_processed')
                ->default(0);

            $table->unsignedInteger('records_created')
                ->default(0);

            $table->unsignedInteger('records_updated')
                ->default(0);

            $table->unsignedInteger('records_failed')
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Error / Notes
            |--------------------------------------------------------------------------
            */

            $table->text('message')->nullable();
            $table->text('error_message')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Raw Provider Response / Debug Metadata
            |--------------------------------------------------------------------------
            */

            $table->json('meta')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Timing
            |--------------------------------------------------------------------------
            */

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index([
                'restaurant_id',
                'status',
            ]);

            $table->index([
                'pos_connection_id',
                'sync_type',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_sync_logs');
    }
};
