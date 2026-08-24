<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantHoliday extends Model
{
    protected $fillable = [
        'restaurant_id',
        'name',
        'holiday_date',
        'type',
        'notes',
        'is_closed',
    ];

    protected $casts = [
        'holiday_date' =>
            'date',

        'is_closed' =>
            'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }
}