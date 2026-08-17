<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Restaurant extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'logo',
        'phone',
        'email',
        'address',
        'is_active',

        // About / Our Story
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

        // Hero Section
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
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function contactSettings(): HasOne
    {
        return $this->hasOne(RestaurantContactSetting::class);
    }

    public function contactMessages(): HasMany
    {
        return $this->hasMany(ContactMessage::class);
    }
}