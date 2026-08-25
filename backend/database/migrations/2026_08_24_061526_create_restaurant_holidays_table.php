<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Safety Check
        |--------------------------------------------------------------------------
        |
        | Prevent migration failure if the table already exists
        | on another/local database but migration history is missing.
        |
        */

        if (Schema::hasTable('restaurant_holidays')) {
            return;
        }

        Schema::create('restaurant_holidays', function (Blueprint $table) {
            $table->id();

            $table->foreignId('restaurant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->date('holiday_date');

            $table->string('type')
                ->default('custom');

            $table->text('notes')
                ->nullable();

            $table->boolean('is_closed')
                ->default(true);

            $table->timestamps();

            $table->index([
                'restaurant_id',
                'holiday_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'restaurant_holidays'
        );
    }
};