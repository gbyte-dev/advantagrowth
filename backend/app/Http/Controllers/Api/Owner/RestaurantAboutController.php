<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RestaurantAboutController extends Controller
{
    /**
     * Get current restaurant Our Story data
     */
    public function show(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        return response()->json([
            'success' => true,
            'about' => [
                'about_years' => $restaurant->about_years,
                'about_title' => $restaurant->about_title,
                'about_description' => $restaurant->about_description,

                'about_image_1' => $restaurant->about_image_1,
                'about_image_2' => $restaurant->about_image_2,

                'about_feature_1_title' => $restaurant->about_feature_1_title,
                'about_feature_1_description' => $restaurant->about_feature_1_description,

                'about_feature_2_title' => $restaurant->about_feature_2_title,
                'about_feature_2_description' => $restaurant->about_feature_2_description,

                'about_feature_3_title' => $restaurant->about_feature_3_title,
                'about_feature_3_description' => $restaurant->about_feature_3_description,
            ],
        ]);
    }


    /**
     * Update Our Story
     */
    public function update(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        $validated = $request->validate([
            'about_years' => ['nullable', 'string', 'max:50'],

            'about_title' => ['required', 'string', 'max:255'],

            'about_description' => ['nullable', 'string'],

            'about_image_1' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120'
            ],

            'about_image_2' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120'
            ],

            'about_feature_1_title' => ['nullable', 'string', 'max:255'],
            'about_feature_1_description' => ['nullable', 'string'],

            'about_feature_2_title' => ['nullable', 'string', 'max:255'],
            'about_feature_2_description' => ['nullable', 'string'],

            'about_feature_3_title' => ['nullable', 'string', 'max:255'],
            'about_feature_3_description' => ['nullable', 'string'],
        ]);


        /*
        |--------------------------------------------------------------------------
        | IMAGE 1
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('about_image_1')) {

            if ($restaurant->about_image_1) {
                Storage::disk('public')->delete(
                    $restaurant->about_image_1
                );
            }

            $validated['about_image_1'] =
                $request->file('about_image_1')
                    ->store('restaurants/about', 'public');
        }


        /*
        |--------------------------------------------------------------------------
        | IMAGE 2
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('about_image_2')) {

            if ($restaurant->about_image_2) {
                Storage::disk('public')->delete(
                    $restaurant->about_image_2
                );
            }

            $validated['about_image_2'] =
                $request->file('about_image_2')
                    ->store('restaurants/about', 'public');
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE DATABASE
        |--------------------------------------------------------------------------
        */

        $restaurant->update($validated);


        return response()->json([
            'success' => true,
            'message' => 'Our Story updated successfully.',
            'about' => [
                'about_years' => $restaurant->about_years,
                'about_title' => $restaurant->about_title,
                'about_description' => $restaurant->about_description,

                'about_image_1' => $restaurant->about_image_1,
                'about_image_2' => $restaurant->about_image_2,

                'about_feature_1_title' =>
                    $restaurant->about_feature_1_title,

                'about_feature_1_description' =>
                    $restaurant->about_feature_1_description,

                'about_feature_2_title' =>
                    $restaurant->about_feature_2_title,

                'about_feature_2_description' =>
                    $restaurant->about_feature_2_description,

                'about_feature_3_title' =>
                    $restaurant->about_feature_3_title,

                'about_feature_3_description' =>
                    $restaurant->about_feature_3_description,
            ],
        ]);
    }
}