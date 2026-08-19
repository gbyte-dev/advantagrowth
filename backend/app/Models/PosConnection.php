<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosConnection extends Model
{
    protected $fillable = [
        'restaurant_id',
        'provider',
        'label',

        'api_key',
        'access_token',
        'base_url',

        'external_merchant_id',

        'status',
        'last_error',

        'last_connected_at',
        'last_synced_at',

        'is_active',
    ];

    protected function casts(): array
    {
        return [
            /*
            |--------------------------------------------------------------------------
            | Secure Credentials
            |--------------------------------------------------------------------------
            |
            | Laravel automatically encrypts these values before saving them
            | and decrypts them when reading through the model.
            |
            */

            'api_key' => 'encrypted',
            'access_token' => 'encrypted',

            /*
            |--------------------------------------------------------------------------
            | Dates
            |--------------------------------------------------------------------------
            */

            'last_connected_at' => 'datetime',
            'last_synced_at' => 'datetime',

            /*
            |--------------------------------------------------------------------------
            | Boolean
            |--------------------------------------------------------------------------
            */

            'is_active' => 'boolean',
        ];
    }

    /**
     * Advanta restaurant that owns this POS connection.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Restaurant / store locations fetched from the POS.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(PosLocation::class);
    }

    /**
     * Sync history for this POS connection.
     */
    public function syncLogs(): HasMany
    {
        return $this->hasMany(PosSyncLog::class);
    }
}