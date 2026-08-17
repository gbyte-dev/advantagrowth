<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthService
{
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {

            $logo = null;

            if (
                isset($data['restaurant_logo']) &&
                $data['restaurant_logo'] instanceof UploadedFile
            ) {
                $logo = $data['restaurant_logo']->store(
                    'restaurants',
                    'public'
                );
            }

            $restaurant = Restaurant::create([
                'name' => $data['restaurant_name'],
                'slug' => Str::slug($data['restaurant_name']) . '-' . uniqid(),
                'logo' => $logo,
                'phone' => $data['phone'],
                'email' => $data['email'],
                'address' => null,
                'is_active' => true,
            ]);

            $user = User::create([
                'restaurant_id' => $restaurant->id,
                'owner_name' => $data['owner_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => $data['password'],
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'restaurant' => $restaurant,
                'user' => $user,
                'token' => $token,
            ];
        });
    }
}