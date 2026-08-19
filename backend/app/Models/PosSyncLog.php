<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosSyncLog extends Model
{
    protected $fillable = [
        'pos_connection_id',
        'restaurant_id',

        'sync_type',
        'status',

        'records_processed',
        'records_created',
        'records_updated',
        'records_failed',

        'message',
        'error_message',

        'meta',

        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',

            'records_processed' => 'integer',
            'records_created' => 'integer',
            'records_updated' => 'integer',
            'records_failed' => 'integer',

            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * POS connection related to this sync.
     */
    public function connection(): BelongsTo
    {
        return $this->belongsTo(
            PosConnection::class,
            'pos_connection_id'
        );
    }

    /**
     * Restaurant related to this sync.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}