<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'pos_connection_id',

        'source',
        'external_order_id',
        'external_location_id',

        'order_type',
        'table_number',

        'customer_name',
        'customer_phone',
        'customer_email',
        'delivery_address',

        'subtotal',
        'tax_amount',
        'delivery_charge',
        'tip_amount',
        'total',

        'status',

        'payment_status',
        'payment_id',
        'payment_method',

        'special_instructions',

        'raw_pos_data',

        'pos_created_at',
        'pos_updated_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'tip_amount' => 'decimal:2',
        'total' => 'decimal:2',

        'raw_pos_data' => 'array',

        'pos_created_at' => 'datetime',
        'pos_updated_at' => 'datetime',
    ];

    public function restaurant()
    {
        return $this->belongsTo(
            Restaurant::class
        );
    }

    public function posConnection()
    {
        return $this->belongsTo(
            PosConnection::class
        );
    }

    public function items()
    {
        return $this->hasMany(
            OrderItem::class
        );
    }
    public function posPayments()
{
    return $this->hasMany(
        PosPayment::class
    );
}
}