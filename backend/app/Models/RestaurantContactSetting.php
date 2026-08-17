<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantContactSetting extends Model
{
    protected $fillable = [
        'restaurant_id',
        'address',
        'phone',
        'email',
        'working_hours',
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'youtube_url',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}