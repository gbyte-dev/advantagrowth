<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('hero_badge')->nullable();
            $table->string('hero_title_line_1')->nullable();
            $table->string('hero_title_line_2')->nullable();
            $table->string('hero_title_line_3')->nullable();
            $table->string('hero_title_line_4')->nullable();
            $table->text('hero_description')->nullable();

            $table->string('hero_image')->nullable();
            $table->string('hero_owner_name')->nullable();

            $table->string('hero_deal_title')->nullable();
            $table->string('hero_deal_subtitle')->nullable();

            $table->string('hero_delivery_time')->nullable();
            $table->string('hero_delivery_subtitle')->nullable();

            $table->string('hero_rating')->nullable();
            $table->string('hero_reviews')->nullable();

            $table->string('hero_explore_button')->nullable();
            $table->string('hero_story_button')->nullable();

            $table->string('hero_customers_count')->nullable();
            $table->string('hero_menu_count')->nullable();
            $table->string('hero_chefs_count')->nullable();
            $table->string('hero_experience_count')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn([
                'hero_badge',
                'hero_title_line_1',
                'hero_title_line_2',
                'hero_title_line_3',
                'hero_title_line_4',
                'hero_description',
                'hero_image',
                'hero_owner_name',
                'hero_deal_title',
                'hero_deal_subtitle',
                'hero_delivery_time',
                'hero_delivery_subtitle',
                'hero_rating',
                'hero_reviews',
                'hero_explore_button',
                'hero_story_button',
                'hero_customers_count',
                'hero_menu_count',
                'hero_chefs_count',
                'hero_experience_count',
            ]);
        });
    }
};