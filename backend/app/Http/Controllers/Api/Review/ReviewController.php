<?php

namespace App\Http\Controllers\Api\Review;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Owner:
     * Get reviews of logged-in owner's restaurant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $reviews = Review::where(
            'restaurant_id',
            $user->restaurant_id
        )
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Owner:
     * Show / Hide review.
     */
    public function toggleVisibility(
        Request $request,
        $id
    ) {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $review = Review::where(
            'restaurant_id',
            $user->restaurant_id
        )->findOrFail($id);

        $review->is_visible = !$review->is_visible;
        $review->save();

        return response()->json([
            'success' => true,
            'message' => 'Review visibility updated.',
            'is_visible' => $review->is_visible,
        ]);
    }

    /**
     * Owner:
     * Delete review.
     */
    public function destroy(
        Request $request,
        $id
    ) {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $review = Review::where(
            'restaurant_id',
            $user->restaurant_id
        )->findOrFail($id);

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
        ]);
    }

    /**
     * Public:
     * Get visible reviews for a restaurant.
     */
    public function restaurantReviews($slug)
    {
        $restaurant = Restaurant::where(
            'slug',
            $slug
        )
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $reviews = Review::where(
            'restaurant_id',
            $restaurant->id
        )
            ->where('is_visible', true)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'restaurant' => $restaurant,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Public:
     * Submit a restaurant review.
     *
     * Customer account/login is NOT required.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'restaurant_id' => [
                'required',
                'integer',
                'exists:restaurants,id',
            ],
            'rating' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],
            'review' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $restaurant = Restaurant::where(
            'id',
            $validated['restaurant_id']
        )
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $review = Review::create([
            'restaurant_id' => $restaurant->id,
            'rating' => $validated['rating'],
            'review' => $validated['review'] ?? null,
            'is_visible' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'review' => $review,
        ], 201);
    }
}