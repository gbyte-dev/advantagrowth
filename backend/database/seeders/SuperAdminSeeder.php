<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
                User::updateOrCreate(
            [
                'email' => 'admin@advanta.com',
            ],
            [
                'restaurant_id' => null,
                'owner_name' => 'Super Admin',
                'phone' => '9999999999',
                'password' => Hash::make('Admin@123'),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}