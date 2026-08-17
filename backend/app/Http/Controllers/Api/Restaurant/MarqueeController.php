<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\RestaurantMarqueeItem;
use Illuminate\Http\Request;

class MarqueeController extends Controller
{
    /**
     * Get marquee items for owner.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $items = RestaurantMarqueeItem::where(
            'restaurant_id',
            $user->restaurant_id
        )
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'items' => $items,
        ]);
    }

    /**
     * Create marquee item.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->restaurant_id) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found.',
            ], 404);
        }

        $validated = $request->validate([
            'text' => [
                'required',
                'string',
                'max:255',
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $item = RestaurantMarqueeItem::create([
            'restaurant_id' => $user->restaurant_id,
            'text' => $validated['text'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Marquee item added successfully.',
            'item' => $item,
        ], 201);
    }

    /**
     * Update marquee item.
     */
    public function update(
        Request $request,
        RestaurantMarqueeItem $marquee
    ) {
        $user = $request->user();

        if (
            !$user ||
            !$user->restaurant_id ||
            $marquee->restaurant_id !== $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'text' => [
                'required',
                'string',
                'max:255',
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ]);

        $marquee->update([
            'text' => $validated['text'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Marquee item updated successfully.',
            'item' => $marquee->fresh(),
        ]);
    }

    /**
     * Delete marquee item.
     */
    public function destroy(
        Request $request,
        RestaurantMarqueeItem $marquee
    ) {
        $user = $request->user();

        if (
            !$user ||
            !$user->restaurant_id ||
            $marquee->restaurant_id !== $user->restaurant_id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $marquee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Marquee item deleted successfully.',
        ]);
    }
}