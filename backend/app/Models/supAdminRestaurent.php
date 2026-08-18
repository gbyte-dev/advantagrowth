<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class supAdminRestaurent extends Model
{
    protected $fillable=[
        'name',
        'location',
        'phone',
        'email',
        'category',
        'dine_in',
        'takeaway',
        'delivery',
        'reservation_available',
        'opening_time',
        'closing_time',
        'currency',
        'timezone',
    ];
    protected $casts = [
        'dine_in' => 'boolean',
        'takeaway' => 'boolean',
        'delivery' => 'boolean',
        'reservation_available' => 'boolean',
    ];
}
