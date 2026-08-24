<?php

namespace App\Http\Controllers\Api\SupAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Restaurant;
use Illuminate\Support\Str;

class RestaurantsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $data = Restaurant::latest()->get();

            return response()->json([
                'success' => true,
                'message' => 'Restaurants fetched successfully',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurants. Please try again.',
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $req)
    {
        $validate=$req->validate([
            'name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:restaurants,email',
            'website' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:100',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
        ]);
        try {
            $validate['slug'] = Str::slug($validate['name']) . '-' . time();
            $restaurant = Restaurant::create($validate);

            return response()->json([
                'success' => true,
                'message' => 'Restaurant created successfully',
                'data' => $restaurant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create restaurant. Please try again.',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $restaurant = Restaurant::find($id);
            if (!$restaurant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurant not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Restaurant fetched successfully',
                'data' => $restaurant,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurant. Please try again.',
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $req, string $id)
    {
        $restaurant=Restaurant::find($id);
           if(!$restaurant){
            return response()->json([
                 'success' => false,
            'message' => 'Restaurant not found',
            ],404);
        }

          $validate=$req->validate([
            'name' => 'required|string|max:255',
            'legal_name' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:255',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255|unique:restaurants,email,' . $id,
            'website' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:100',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
        ]);
        try {
            $restaurant->update($validate);

            return response()->json([
                'success' => true,
                'message' => 'Restaurant updated successfully',
                'data' => $restaurant->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update restaurant. Please try again.',
            ], 500);
        }
    }

    /**
     * Toggle the active/blocked status of the specified resource.
     */
    public function toggleStatus(string $id)
    {
        $restaurant = Restaurant::find($id);
        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found',
            ], 404);
        }

        try {
            $restaurant->is_active = !$restaurant->is_active;
            $restaurant->save();

            return response()->json([
                'success' => true,
                'message' => $restaurant->is_active ? 'Restaurant unblocked successfully' : 'Restaurant blocked successfully',
                'is_active' => $restaurant->is_active,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update restaurant status. Please try again.',
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $restaurant=Restaurant::find($id);
        if(!$restaurant){
            return response()->json([
            'success' => false,
            'message' => 'Restaurant not found',
            ],404);
        }
        try {
            $restaurant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Restaurant deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete restaurant. Please try again.',
            ], 500);
        }
    }
}
