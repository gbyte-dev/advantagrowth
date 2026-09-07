<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailOtp extends Model
{   
    public const PURPOSE_EMAIL_VERIFICATION =
    'email_verification';
    
    public const PURPOSE_PASSWORD_RESET =
        'password_reset';

    public const EXPIRY_MINUTES =
        10;

    public const RESEND_COOLDOWN_SECONDS =
        60;

    public const MAX_ATTEMPTS =
        5;

    protected $fillable = [
        'user_id',
        'purpose',
        'otp',
        'attempts',
        'sent_at',
        'expires_at',
        'verified_at',
        'consumed_at',
        'reset_token_hash',
    ];

    protected $hidden = [
        'otp',
        'reset_token_hash',
    ];

    protected $casts = [
        'attempts' =>
            'integer',

        'sent_at' =>
            'datetime',

        'expires_at' =>
            'datetime',

        'verified_at' =>
            'datetime',

        'consumed_at' =>
            'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }

    public function isExpired(): bool
    {
        return $this->expires_at
            ->isPast();
    }

    public function hasTooManyAttempts(): bool
    {
        return $this->attempts >=
            self::MAX_ATTEMPTS;
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }
}