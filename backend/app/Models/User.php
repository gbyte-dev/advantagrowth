<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'restaurant_id',
        'owner_name',
        'email',
        'phone',
        'password',
        'username',
        'role',
        'staff_role',
        'profile_image',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    /**
     * Restaurant Relationship
     */
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Role Helpers
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SUPER_ADMIN->value;
    }

    public function isOwner(): bool
    {
        return $this->role === UserRole::OWNER->value;
    }

    public function isStaff(): bool
    {
        return $this->role === UserRole::STAFF->value;
    }

    public function isCustomer(): bool
    {
        return $this->role === UserRole::CUSTOMER->value;
    }
}