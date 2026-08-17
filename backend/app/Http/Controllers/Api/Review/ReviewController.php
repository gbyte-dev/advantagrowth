<?php

namespace App\Http\Controllers\Api\Review;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | OWNER
    |--------------------------------------------------------------------------
    */

    /**
     * Get reviews of logged-in owner's restaurant.
     */
    public function index(Request $request)
    {
        $restaurantId = $request->user()->restaurant_id;

        $reviews = Review::where(
            'restaurant_id',
            $restaurantId
        )
            ->with('customer:id,name')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }


    /**
     * Owner: Show / Hide review.
     */
    public function toggleVisibility(
        Request $request,
        $id
    ) {
        $review = Review::where(
            'restaurant_id',
            $request->user()->restaurant_id
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
     * Owner: Delete review.
     */
    public function destroy(
        Request $request,
        $id
    ) {
        $review = Review::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )->findOrFail($id);

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    /**
     * Customer submits a review.
     */
    public function store(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $restaurant = Restaurant::where(
            'id',
            $request->restaurant_id
        )
            ->where('is_active', true)
            ->first();

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $existingReview = Review::where(
            'restaurant_id',
            $restaurant->id
        )
            ->where(
                'customer_id',
                $request->user()->id
            )
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this restaurant.',
            ], 422);
        }

        $review = Review::create([
            'restaurant_id' => $restaurant->id,
            'customer_id' => $request->user()->id,
            'rating' => $request->rating,
            'review' => $request->review,
            'is_visible' => true,
        ]);

        $review->load('customer:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'review' => $review,
        ], 201);
    }


    /**
     * Customer:
     * Get visible reviews by restaurant slug.
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
            ->with('customer:id,name')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'restaurant' => $restaurant,
            'reviews' => $reviews,
        ]);
    }
}