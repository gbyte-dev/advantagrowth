<?php

namespace App\Http\Controllers\Api\Menu;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
 * Get complete restaurant menu.
 */
public function index(Request $request)
{
    $user = $request->user();

    /*
     * Owner / Staff:
     * restaurant_id directly user ke account se milega.
     *
     * Customer:
     * Customer table me abhi restaurant_id null ho sakta hai,
     * isliye single-restaurant setup me first active restaurant
     * use kar rahe hain.
     */
    if ($user instanceof \App\Models\Customer) {

        $restaurantId = \App\Models\Restaurant::where(
            'is_active',
            true
        )->value('id');

    } else {

        $restaurantId = $user->restaurant_id;
    }

    /*
     * Agar restaurant nahi mila
     */
    if (!$restaurantId) {
        return response()->json([
            'categories' => [],
        ]);
    }

    $categories = MenuCategory::where(
        'restaurant_id',
        $restaurantId
    )
        ->where('is_active', true)
        ->with([
            'items' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('id');
            }
        ])
        ->orderBy('sort_order')
        ->orderBy('id')
        ->get();

    return response()->json([
        'categories' => $categories,
    ]);
}


    /**
     * Create Category.
     */
    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = MenuCategory::create([
            'restaurant_id' => $request->user()->restaurant_id,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }


    /**
     * Update Category.
     */
    public function updateCategory(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = MenuCategory::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $id)
            ->firstOrFail();

        $category->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category,
        ]);
    }


    /**
     * Delete Category.
     */
    public function destroyCategory(Request $request, $id)
    {
        $category = MenuCategory::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $id)
            ->firstOrFail();

        /*
         * Menu items are deleted automatically
         * because menu_items uses cascadeOnDelete().
         */
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }


    /**
     * Create Menu Item.
     */
    public function storeItem(Request $request)
    {
        $request->validate([
            'menu_category_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'food_type' => 'required|in:veg,non_veg,egg',
        ]);

        $category = MenuCategory::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $request->menu_category_id)
            ->where('is_active', true)
            ->firstOrFail();

        $item = MenuItem::create([
            'restaurant_id' => $request->user()->restaurant_id,
            'menu_category_id' => $category->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'food_type' => $request->food_type,
            'is_available' => true,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        return response()->json([
            'message' => 'Menu item created successfully.',
            'item' => $item,
        ], 201);
    }


    /**
     * Update Menu Item.
     */
    public function updateItem(Request $request, $id)
    {
        $request->validate([
            'menu_category_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'food_type' => 'required|in:veg,non_veg,egg',
        ]);

        $item = MenuItem::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $id)
            ->firstOrFail();

        MenuCategory::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $request->menu_category_id)
            ->firstOrFail();

        $item->update([
            'menu_category_id' => $request->menu_category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'food_type' => $request->food_type,
        ]);

        return response()->json([
            'message' => 'Menu item updated successfully.',
            'item' => $item,
        ]);
    }


    /**
     * Delete Menu Item.
     */
    public function destroyItem(Request $request, $id)
    {
        $item = MenuItem::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $id)
            ->firstOrFail();

        $item->delete();

        return response()->json([
            'message' => 'Menu item deleted successfully.',
        ]);
    }


    /**
     * Toggle Item Availability.
     */
    public function toggleItemAvailability(Request $request, $id)
    {
        $item = MenuItem::where(
            'restaurant_id',
            $request->user()->restaurant_id
        )
            ->where('id', $id)
            ->firstOrFail();

        $item->is_available = !$item->is_available;
        $item->save();

        return response()->json([
            'message' => 'Menu item availability updated.',
            'is_available' => $item->is_available,
        ]);
    }
}