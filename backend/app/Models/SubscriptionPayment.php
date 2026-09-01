<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPayment extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'restaurant_id',
        'subscription_id',
        'restaurant_subscription_id',
        'provider',
        'receipt',
        'provider_order_id',
        'provider_payment_id',
        'amount_minor',
        'amount',
        'currency',
        'status',
        'payment_method',
        'verified_at',
        'paid_at',
        'failed_at',
        'failure_reason',
        'provider_payload',
    ];

    protected $casts = [
        'restaurant_id' => 'integer',
        'subscription_id' => 'integer',
        'restaurant_subscription_id' => 'integer',
        'amount_minor' => 'integer',
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'provider_payload' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(
            Subscription::class
        );
    }

    public function restaurantSubscription(): BelongsTo
    {
        return $this->belongsTo(
            RestaurantSubscription::class
        );
    }
}