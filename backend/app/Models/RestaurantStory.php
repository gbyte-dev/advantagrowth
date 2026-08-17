<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RestaurantStory extends Model
{
    protected $fillable = [
        'restaurant_id',
        'label',
        'years',
        'main_image',
        'secondary_image',
        'title',
        'description',

        'feature_1_title',
        'feature_1_description',
        'feature_1_icon',

        'feature_2_title',
        'feature_2_description',
        'feature_2_icon',

        'feature_3_title',
        'feature_3_description',
        'feature_3_icon',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}