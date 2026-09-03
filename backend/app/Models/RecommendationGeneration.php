<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecommendationGeneration extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'restaurant_id',
        'status',
        'period_start',
        'period_end',
        'model',
        'summary',
        'analytics_snapshot',
        'input_tokens',
        'output_tokens',
        'generated_at',
        'failed_at',
        'failure_reason',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'summary' => 'array',
        'analytics_snapshot' => 'array',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'generated_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(
            Recommendation::class
        );
    }
}