<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPlanFeature extends Model
{
    protected $fillable = [
        'subscription_id',
        'subscription_feature_id',
        'is_enabled',
        'limit_value',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'limit_value' => 'integer',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(
            Subscription::class
        );
    }

    public function feature(): BelongsTo
    {
        return $this->belongsTo(
            SubscriptionFeature::class,
            'subscription_feature_id'
        );
    }
}