<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'restaurant_id',
        'customer_name',
        'phone',
        'email',
        'guests',
        'reservation_date',
        'reservation_time',
        'special_requests',
        'status',
    ];

    protected $casts = [
        'reservation_date' => 'date',
    ];

    /**
     * Reservation belongs to restaurant
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function story(): HasOne
{
    return $this->hasOne(RestaurantStory::class);
}

}