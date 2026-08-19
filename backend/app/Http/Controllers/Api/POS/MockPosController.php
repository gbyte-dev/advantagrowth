<?php

namespace App\Http\Controllers\Api\POS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MockPosController extends Controller
{
    /**
     * Mock POS restaurant details.
     */
    public function restaurant(Request $request)
    {
        return response()->json([
            'id' => 'merchant_demo_001',

            'name' => 'Advanta Demo Restaurant',

            'legal_name' =>
                'Advanta Demo Restaurant Pvt Ltd',

            'phone' => '+91 9876543210',

            'email' =>
                'restaurant@example.com',

            'address' => [
                'line1' =>
                    '25 Restaurant Street',

                'line2' =>
                    'Business District',

                'city' => 'New Delhi',

                'postal_code' => '110001',

                'country' => 'India',
            ],

            'currency' => 'INR',

            'timezone' => 'Asia/Kolkata',
        ]);
    }

    /**
     * Mock POS restaurant locations.
     */
    public function locations(Request $request)
    {
        return response()->json([
            'locations' => [
                [
                    'id' =>
                        'location_demo_001',

                    'business_id' =>
                        'merchant_demo_001',

                    'name' =>
                        'Advanta Demo Restaurant - Main',

                    'legal_name' =>
                        'Advanta Demo Restaurant Pvt Ltd',

                    'phone' =>
                        '+91 9876543210',

                    'email' =>
                        'restaurant@example.com',

                    'address' => [
                        'line1' =>
                            '25 Restaurant Street',

                        'line2' =>
                            'Business District',

                        'city' =>
                            'New Delhi',

                        'postal_code' =>
                            '110001',

                        'country' =>
                            'India',
                    ],

                    'currency' => 'INR',

                    'timezone' =>
                        'Asia/Kolkata',
                ],

                [
                    'id' =>
                        'location_demo_002',

                    'business_id' =>
                        'merchant_demo_001',

                    'name' =>
                        'Advanta Demo Restaurant - Branch',

                    'phone' =>
                        '+91 9876543211',

                    'email' =>
                        'branch@example.com',

                    'address' => [
                        'line1' =>
                            '80 Market Road',

                        'city' =>
                            'Gurugram',

                        'postal_code' =>
                            '122001',

                        'country' =>
                            'India',
                    ],

                    'currency' => 'INR',

                    'timezone' =>
                        'Asia/Kolkata',
                ],
            ],
        ]);
    }
}
