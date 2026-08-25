<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'currency' => Setting::get('platform_currency', 'INR'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings.',
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'currency' => 'required|string|max:10',
        ]);

        try {
            Setting::set('platform_currency', $validated['currency']);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => [
                    'currency' => $validated['currency'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings.',
            ], 500);
        }
    }
}
