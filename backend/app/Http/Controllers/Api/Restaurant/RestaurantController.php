<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\MenuCategory;
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
                'logo',
                'phone',
                'email',
                'address',
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
                }
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
 * Get active marquee items of selected restaurant.
 */
public function marquee($slug)
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

    $marqueeItems = \App\Models\RestaurantMarqueeItem::where(
        'restaurant_id',
        $restaurant->id
    )
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->orderBy('id')
        ->get([
            'id',
            'text',
            'sort_order',
            'is_active',
        ]);

    return response()->json([
        'success' => true,
        'marquee_items' => $marqueeItems,
    ]);
}

    /**
 * Update restaurant Our Story.
 */
public function updateAbout(Request $request)
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
        'about_years' => ['nullable', 'string', 'max:50'],

        'about_title' => ['nullable', 'string', 'max:255'],

        'about_description' => [
            'nullable',
            'string',
            'max:1000',
        ],

        'about_image_1' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],

        'about_image_2' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],

        'about_feature_1_title' => [
            'nullable',
            'string',
            'max:255',
        ],

        'about_feature_1_description' => [
            'nullable',
            'string',
            'max:500',
        ],

        'about_feature_2_title' => [
            'nullable',
            'string',
            'max:255',
        ],

        'about_feature_2_description' => [
            'nullable',
            'string',
            'max:500',
        ],

        'about_feature_3_title' => [
            'nullable',
            'string',
            'max:255',
        ],

        'about_feature_3_description' => [
            'nullable',
            'string',
            'max:500',
        ],
    ]);

    /*
    |--------------------------------------------------------------------------
    | Upload Image 1
    |--------------------------------------------------------------------------
    */

    if ($request->hasFile('about_image_1')) {
        $validated['about_image_1'] = $request
            ->file('about_image_1')
            ->store('restaurants/about', 'public');
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Image 2
    |--------------------------------------------------------------------------
    */

    if ($request->hasFile('about_image_2')) {
        $validated['about_image_2'] = $request
            ->file('about_image_2')
            ->store('restaurants/about', 'public');
    }

    $restaurant->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Our Story updated successfully.',
        'restaurant' => $restaurant,
    ]);
}

/**
 * Update restaurant profile.
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
        'name' => ['required', 'string', 'max:255'],
        'phone' => ['nullable', 'string', 'max:20'],
        'email' => ['nullable', 'email', 'max:255'],
        'address' => ['nullable', 'string', 'max:1000'],
    ]);

    $restaurant->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Restaurant profile updated successfully.',
        'restaurant' => $restaurant,
    ]);
}

}