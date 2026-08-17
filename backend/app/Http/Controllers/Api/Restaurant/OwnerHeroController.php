<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Restaurant;

class OwnerHeroController extends Controller
{
    /**
     * Get logged-in owner's restaurant hero data.
     */
    public function show(Request $request)
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
            'hero' => [
                'hero_badge' => $restaurant->hero_badge,
                'hero_title_line_1' => $restaurant->hero_title_line_1,
                'hero_title_line_2' => $restaurant->hero_title_line_2,
                'hero_title_line_3' => $restaurant->hero_title_line_3,
                'hero_title_line_4' => $restaurant->hero_title_line_4,
                'hero_description' => $restaurant->hero_description,
                'hero_image' => $restaurant->hero_image
                    ? asset('storage/' . $restaurant->hero_image)
                    : null,
                'hero_owner_name' => $restaurant->hero_owner_name,
                'hero_deal_title' => $restaurant->hero_deal_title,
                'hero_deal_subtitle' => $restaurant->hero_deal_subtitle,
                'hero_delivery_time' => $restaurant->hero_delivery_time,
                'hero_delivery_subtitle' => $restaurant->hero_delivery_subtitle,
                'hero_rating' => $restaurant->hero_rating,
                'hero_reviews' => $restaurant->hero_reviews,
                'hero_explore_button' => $restaurant->hero_explore_button,
                'hero_story_button' => $restaurant->hero_story_button,
                'hero_customers_count' => $restaurant->hero_customers_count,
                'hero_menu_count' => $restaurant->hero_menu_count,
                'hero_chefs_count' => $restaurant->hero_chefs_count,
                'hero_experience_count' => $restaurant->hero_experience_count,
            ],
        ]);
    }


    /**
     * Update logged-in owner's restaurant hero.
     */
    public function update(Request $request)
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
            'hero_badge' => 'nullable|string|max:255',
            'hero_title_line_1' => 'nullable|string|max:255',
            'hero_title_line_2' => 'nullable|string|max:255',
            'hero_title_line_3' => 'nullable|string|max:255',
            'hero_title_line_4' => 'nullable|string|max:255',
            'hero_description' => 'nullable|string|max:2000',

            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',

            'hero_owner_name' => 'nullable|string|max:255',
            'hero_deal_title' => 'nullable|string|max:255',
            'hero_deal_subtitle' => 'nullable|string|max:255',

            'hero_delivery_time' => 'nullable|string|max:100',
            'hero_delivery_subtitle' => 'nullable|string|max:255',

            'hero_rating' => 'nullable|string|max:50',
            'hero_reviews' => 'nullable|string|max:100',

            'hero_explore_button' => 'nullable|string|max:100',
            'hero_story_button' => 'nullable|string|max:100',

            'hero_customers_count' => 'nullable|string|max:50',
            'hero_menu_count' => 'nullable|string|max:50',
            'hero_chefs_count' => 'nullable|string|max:50',
            'hero_experience_count' => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('hero_image')) {

            if ($restaurant->hero_image) {
                Storage::disk('public')->delete($restaurant->hero_image);
            }

            $validated['hero_image'] = $request
                ->file('hero_image')
                ->store('restaurants/hero', 'public');
        }

        $restaurant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Hero section updated successfully.',
            'hero' => [
                'hero_badge' => $restaurant->hero_badge,
                'hero_title_line_1' => $restaurant->hero_title_line_1,
                'hero_title_line_2' => $restaurant->hero_title_line_2,
                'hero_title_line_3' => $restaurant->hero_title_line_3,
                'hero_title_line_4' => $restaurant->hero_title_line_4,
                'hero_description' => $restaurant->hero_description,
                'hero_image' => $restaurant->hero_image
                    ? asset('storage/' . $restaurant->hero_image)
                    : null,
                'hero_owner_name' => $restaurant->hero_owner_name,
                'hero_deal_title' => $restaurant->hero_deal_title,
                'hero_deal_subtitle' => $restaurant->hero_deal_subtitle,
                'hero_delivery_time' => $restaurant->hero_delivery_time,
                'hero_delivery_subtitle' => $restaurant->hero_delivery_subtitle,
                'hero_rating' => $restaurant->hero_rating,
                'hero_reviews' => $restaurant->hero_reviews,
                'hero_explore_button' => $restaurant->hero_explore_button,
                'hero_story_button' => $restaurant->hero_story_button,
                'hero_customers_count' => $restaurant->hero_customers_count,
                'hero_menu_count' => $restaurant->hero_menu_count,
                'hero_chefs_count' => $restaurant->hero_chefs_count,
                'hero_experience_count' => $restaurant->hero_experience_count,
            ],
        ]);
    }
}