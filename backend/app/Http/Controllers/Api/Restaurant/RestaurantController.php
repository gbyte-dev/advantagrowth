<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    /**
     * Get all active restaurants for customers.
     */
    public function index()
    {
        $restaurants = Restaurant::where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'slug',
                'phone',
                'email',
            ]);

        return response()->json([
            'success' => true,
            'restaurants' => $restaurants,
        ]);
    }

    /**
     * Get one active restaurant by slug.
     */
    public function show($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'restaurant' => $restaurant,
        ]);
    }

    /**
     * Get menu of selected restaurant.
     */
    public function menu($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $categories = MenuCategory::where(
            'restaurant_id',
            $restaurant->id
        )
            ->where('is_active', true)
            ->with([
                'items' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->where('is_available', true)
                        ->orderBy('sort_order')
                        ->orderBy('id');
                },
            ])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'restaurant' => $restaurant,
            'categories' => $categories,
        ]);
    }

    /**
     * Get active staff of selected restaurant.
     */
    public function staff($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $staff = User::where('restaurant_id', $restaurant->id)
            ->where('role', 'staff')
            ->where('is_active', true)
            ->orderBy('id')
            ->get([
                'id',
                'owner_name',
                'staff_role',
                'profile_image',
            ]);

        return response()->json([
            'success' => true,
            'staff' => $staff,
        ]);
    }

    /**
     * Get logged-in owner's restaurant profile.
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $restaurant = Restaurant::find($user->restaurant_id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'restaurant' => [
                'id' => $restaurant->id,

                // Basic Information
                'name' => $restaurant->name,
                'legal_name' => $restaurant->legal_name,
                'business_category' => $restaurant->business_category,
                'vat_number' => $restaurant->vat_number,

                // Location
                'address_line_1' => $restaurant->address_line_1,
                'address_line_2' => $restaurant->address_line_2,
                'city' => $restaurant->city,
                'postal_code' => $restaurant->postal_code,
                'country' => $restaurant->country,

                // Contact Information
                'phone' => $restaurant->phone,
                'email' => $restaurant->email,
                'website' => $restaurant->website,

                // Operational Settings
                'currency' => $restaurant->currency,
                'timezone' => $restaurant->timezone,
                'opening_time' => $restaurant->opening_time,
                'closing_time' => $restaurant->closing_time,
            ],
        ]);
    }

    /**
     * Update logged-in owner's restaurant profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $restaurant = Restaurant::find($user->restaurant_id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $validated = $request->validate([
            // Basic Information
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'legal_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'business_category' => [
                'nullable',
                'string',
                'max:255',
            ],

            'vat_number' => [
                'nullable',
                'string',
                'max:100',
            ],

            // Location
            'address_line_1' => [
                'nullable',
                'string',
                'max:255',
            ],

            'address_line_2' => [
                'nullable',
                'string',
                'max:255',
            ],

            'city' => [
                'nullable',
                'string',
                'max:100',
            ],

            'postal_code' => [
                'nullable',
                'string',
                'max:30',
            ],

            'country' => [
                'nullable',
                'string',
                'max:100',
            ],

            // Contact Information
            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'website' => [
                'nullable',
                'url',
                'max:255',
            ],

            // Operational Settings
            'currency' => [
                'nullable',
                'string',
                'max:10',
            ],

            'timezone' => [
                'nullable',
                'string',
                'max:100',
            ],

            'opening_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'closing_time' => [
                'nullable',
                'date_format:H:i',
            ],
        ]);

        $restaurant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant profile updated successfully.',
            'restaurant' => $restaurant->fresh(),
        ]);
    }
}