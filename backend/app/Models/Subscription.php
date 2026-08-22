<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'currency',
        'interval',
        'interval_count',
        'is_active',
        'description',
    ];
    protected $casts=[
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];
}
