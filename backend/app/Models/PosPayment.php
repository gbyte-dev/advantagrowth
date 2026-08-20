<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosPayment extends Model
{
    protected $fillable = [
        'restaurant_id',
        'order_id',
        'pos_connection_id',

        'external_payment_id',

        'payment_method',
        'card_type',

        'amount',
        'tip_amount',

        'status',
        'paid_at',

        'raw_pos_data',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tip_amount' => 'decimal:2',

        'paid_at' => 'datetime',

        'raw_pos_data' => 'array',
    ];

    public function restaurant()
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }

    public function order()
    {
        return $this->belongsTo(
            Order::class
        );
    }

    public function posConnection()
    {
        return $this->belongsTo(
            PosConnection::class
        );
    }
}
