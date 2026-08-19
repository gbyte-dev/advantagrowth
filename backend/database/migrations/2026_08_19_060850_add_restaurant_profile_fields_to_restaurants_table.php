<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | Basic Information
            |--------------------------------------------------------------------------
            */

            $table->string('legal_name')->nullable()->after('name');

            $table->string('business_category')
                ->nullable()
                ->after('legal_name');

            $table->string('vat_number')
                ->nullable()
                ->after('business_category');


            /*
            |--------------------------------------------------------------------------
            | Location
            |--------------------------------------------------------------------------
            */

            $table->string('address_line_1')
                ->nullable()
                ->after('vat_number');

            $table->string('address_line_2')
                ->nullable()
                ->after('address_line_1');

            $table->string('city')
                ->nullable()
                ->after('address_line_2');

            $table->string('postal_code', 30)
                ->nullable()
                ->after('city');

            $table->string('country', 100)
                ->nullable()
                ->after('postal_code');


            /*
            |--------------------------------------------------------------------------
            | Contact Information
            |--------------------------------------------------------------------------
            */

            $table->string('website')
                ->nullable()
                ->after('email');


            /*
            |--------------------------------------------------------------------------
            | Operational Settings
            |--------------------------------------------------------------------------
            */

            $table->string('currency', 10)
                ->nullable()
                ->after('website');

            $table->string('timezone', 100)
                ->nullable()
                ->after('currency');

            $table->time('opening_time')
                ->nullable()
                ->after('timezone');

            $table->time('closing_time')
                ->nullable()
                ->after('opening_time');
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn([
                'legal_name',
                'business_category',
                'vat_number',
                'address_line_1',
                'address_line_2',
                'city',
                'postal_code',
                'country',
                'website',
                'currency',
                'timezone',
                'opening_time',
                'closing_time',
            ]);
        });
    }
};