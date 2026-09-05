<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recommendation extends Model
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_DISMISSED = 'dismissed';
    public const STATUS_IMPLEMENTED = 'implemented';

    protected $fillable = [
        'recommendation_generation_id',
        'restaurant_id',
        'category',
        'priority',
        'confidence',
        'title',
        'description',
        'problem',
        'solution',
        'expected_impact',
        'status',
    ];

    protected $casts = [
        'confidence' => 'integer',
    ];

    public function generation(): BelongsTo
    {
        return $this->belongsTo(
            RecommendationGeneration::class,
            'recommendation_generation_id'
        );
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }
        public function feedback(): HasMany
    {
        return $this->hasMany(
            RecommendationFeedback::class
        );
    }
}