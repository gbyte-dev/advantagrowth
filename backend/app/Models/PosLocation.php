<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosLocation extends Model
{
    protected $fillable = [
        'pos_connection_id',
        'restaurant_id',

        'external_location_id',
        'external_business_id',

        'name',
        'legal_name',

        'phone',
        'email',

        'address_line_1',
        'address_line_2',
        'city',
        'postal_code',
        'country',

        'currency',
        'timezone',

        'raw_data',

        'last_fetched_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'raw_data' => 'array',
            'last_fetched_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * POS connection this location belongs to.
     */
    public function connection(): BelongsTo
    {
        return $this->belongsTo(
            PosConnection::class,
            'pos_connection_id'
        );
    }

    /**
     * Advanta restaurant this POS location belongs to.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}