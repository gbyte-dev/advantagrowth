<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionFeature extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'value_type',
        'unit',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function planFeatures(): HasMany
    {
        return $this->hasMany(
            SubscriptionPlanFeature::class
        );
    }

    public function subscriptions(): BelongsToMany
    {
        return $this
            ->belongsToMany(
                Subscription::class,
                'subscription_plan_features'
            )
            ->withPivot([
                'is_enabled',
                'limit_value',
            ])
            ->withTimestamps();
    }
}