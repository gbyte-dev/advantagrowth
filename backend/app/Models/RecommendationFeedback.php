<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecommendationFeedback extends Model
{
    public const FEEDBACK_USEFUL =
        'useful';

    public const FEEDBACK_NOT_USEFUL =
        'not_useful';

    protected $table =
        'recommendation_feedback';

    protected $fillable = [
        'restaurant_id',
        'recommendation_id',
        'user_id',
        'feedback',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }

    public function recommendation(): BelongsTo
    {
        return $this->belongsTo(
            Recommendation::class
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}