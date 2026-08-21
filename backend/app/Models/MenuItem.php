<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
    'restaurant_id',
    'pos_connection_id',
    'external_item_id',

    'menu_category_id',

    'name',
    'description',
    'price',
    'image',
    'food_type',
    'is_available',
    'is_active',
    'sort_order',
];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }
}