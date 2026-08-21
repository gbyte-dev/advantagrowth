<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',

        'menu_item_id',

        'external_item_id',
        'external_menu_item_id',

        'item_name',

        'unit_price',
        'quantity',
        'total_price',

        'modifiers',
        'raw_pos_data',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity' => 'integer',
        'total_price' => 'decimal:2',

        'modifiers' => 'array',
        'raw_pos_data' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(
            Order::class
        );
    }

    public function menuItem()
    {
        return $this->belongsTo(
            MenuItem::class
        );
    }
}