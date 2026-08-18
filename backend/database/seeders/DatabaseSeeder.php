<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,
        ]);
        \App\Models\supAdminRestaurent::create([
            'name' => 'The Spice Garden',
            'location' => 'Hazratganj, Lucknow, Uttar Pradesh',
            'phone' => '9876543210',
            'email' => 'thespicegarden@gmail.com',
            'category' => 'Fine Dining',

            'dine_in' => true,
            'takeaway' => true,
            'delivery' => true,
            'reservation_available' => true,

            'opening_time' => '10:00:00',
            'closing_time' => '22:00:00',

            'currency' => 'INR',
            'timezone' => 'Asia/Kolkata',
        ]);
    }
}