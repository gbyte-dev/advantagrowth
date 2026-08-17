<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {

            // OUR STORY
            $table->string('about_years')->nullable();
            $table->string('about_title')->nullable();
            $table->text('about_description')->nullable();

            // ABOUT IMAGES
            $table->string('about_image_1')->nullable();
            $table->string('about_image_2')->nullable();

            // FEATURE 1
            $table->string('about_feature_1_title')->nullable();
            $table->text('about_feature_1_description')->nullable();

            // FEATURE 2
            $table->string('about_feature_2_title')->nullable();
            $table->text('about_feature_2_description')->nullable();

            // FEATURE 3
            $table->string('about_feature_3_title')->nullable();
            $table->text('about_feature_3_description')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn([
                'about_years',
                'about_title',
                'about_description',
                'about_image_1',
                'about_image_2',
                'about_feature_1_title',
                'about_feature_1_description',
                'about_feature_2_title',
                'about_feature_2_description',
                'about_feature_3_title',
                'about_feature_3_description',
            ]);
        });
    }
};