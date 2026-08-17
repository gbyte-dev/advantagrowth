<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\RestaurantStory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RestaurantStoryController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $story = RestaurantStory::where(
            'restaurant_id',
            $user->restaurant_id
        )->first();

        return response()->json([
            'story' => $story,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'years' => ['nullable', 'string', 'max:50'],

            'main_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'secondary_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],

            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            'feature_1_title' => ['nullable', 'string', 'max:255'],
            'feature_1_description' => ['nullable', 'string'],
            'feature_1_icon' => ['nullable', 'string', 'max:100'],

            'feature_2_title' => ['nullable', 'string', 'max:255'],
            'feature_2_description' => ['nullable', 'string'],
            'feature_2_icon' => ['nullable', 'string', 'max:100'],

            'feature_3_title' => ['nullable', 'string', 'max:255'],
            'feature_3_description' => ['nullable', 'string'],
            'feature_3_icon' => ['nullable', 'string', 'max:100'],
        ]);

        $story = RestaurantStory::firstOrNew([
            'restaurant_id' => $user->restaurant_id,
        ]);

        if ($request->hasFile('main_image')) {
            if ($story->main_image) {
                Storage::disk('public')->delete($story->main_image);
            }

            $validated['main_image'] = $request
                ->file('main_image')
                ->store('restaurant/stories', 'public');
        }

        if ($request->hasFile('secondary_image')) {
            if ($story->secondary_image) {
                Storage::disk('public')->delete($story->secondary_image);
            }

            $validated['secondary_image'] = $request
                ->file('secondary_image')
                ->store('restaurant/stories', 'public');
        }

        $story->fill($validated);
        $story->restaurant_id = $user->restaurant_id;
        $story->save();

        return response()->json([
            'message' => 'Our Story updated successfully.',
            'story' => $story,
        ]);
    }
}