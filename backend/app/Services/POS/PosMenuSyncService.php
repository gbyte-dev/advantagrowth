<?php

namespace App\Services\POS;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\PosConnection;
use Illuminate\Support\Facades\DB;

class PosMenuSyncService
{
    public function sync(
        PosConnection $connection,
        array $categories
    ): array {
        $result = [
            'categories_processed' => 0,
            'categories_created' => 0,
            'categories_updated' => 0,

            'items_processed' => 0,
            'items_created' => 0,
            'items_updated' => 0,
        ];

        DB::transaction(
            function () use (
                $connection,
                $categories,
                &$result
            ) {
                foreach (
                    $categories
                    as $categoryData
                ) {
                    if (
                        !is_array($categoryData)
                    ) {
                        continue;
                    }

                    $externalCategoryId =
                        $categoryData[
                            'external_category_id'
                        ] ?? null;

                    if (!$externalCategoryId) {
                        continue;
                    }

                    $result[
                        'categories_processed'
                    ]++;

                    $category =
                        MenuCategory::where(
                            'pos_connection_id',
                            $connection->id
                        )
                            ->where(
                                'external_category_id',
                                $externalCategoryId
                            )
                            ->first();

                    $categoryValues = [
                        'restaurant_id' =>
                            $connection
                                ->restaurant_id,

                        'pos_connection_id' =>
                            $connection->id,

                        'external_category_id' =>
                            $externalCategoryId,

                        'name' =>
                            $categoryData[
                                'name'
                            ] ?? 'POS Category',

                        'description' =>
                            $categoryData[
                                'description'
                            ] ?? null,

                        'is_active' =>
                            (bool) (
                                $categoryData[
                                    'is_active'
                                ] ?? true
                            ),

                        'sort_order' =>
                            (int) (
                                $categoryData[
                                    'sort_order'
                                ] ?? 0
                            ),
                    ];

                    if ($category) {
                        $category->update(
                            $categoryValues
                        );

                        $result[
                            'categories_updated'
                        ]++;
                    } else {
                        $category =
                            MenuCategory::create(
                                $categoryValues
                            );

                        $result[
                            'categories_created'
                        ]++;
                    }

                    $items =
                        $categoryData[
                            'items'
                        ] ?? [];

                    if (!is_array($items)) {
                        continue;
                    }

                    foreach (
                        $items
                        as $itemData
                    ) {
                        if (
                            !is_array($itemData)
                        ) {
                            continue;
                        }

                        $externalItemId =
                            $itemData[
                                'external_item_id'
                            ] ?? null;

                        if (!$externalItemId) {
                            continue;
                        }

                        $result[
                            'items_processed'
                        ]++;

                        $item =
                            MenuItem::where(
                                'pos_connection_id',
                                $connection->id
                            )
                                ->where(
                                    'external_item_id',
                                    $externalItemId
                                )
                                ->first();

                        $itemValues = [
                            'restaurant_id' =>
                                $connection
                                    ->restaurant_id,

                            'pos_connection_id' =>
                                $connection->id,

                            'external_item_id' =>
                                $externalItemId,

                            'menu_category_id' =>
                                $category->id,

                            'name' =>
                                $itemData[
                                    'name'
                                ] ?? 'POS Item',

                            'description' =>
                                $itemData[
                                    'description'
                                ] ?? null,

                            'price' =>
                                round(
                                    (float) (
                                        $itemData[
                                            'price'
                                        ] ?? 0
                                    ),
                                    2
                                ),

                            'image' =>
                                $itemData[
                                    'image'
                                ] ?? null,

                            'food_type' =>
                                $this->normalizeFoodType(
                                    $itemData[
                                        'food_type'
                                    ] ?? null
                                ),

                            'is_available' =>
                                (bool) (
                                    $itemData[
                                        'is_available'
                                    ] ?? true
                                ),

                            'is_active' =>
                                (bool) (
                                    $itemData[
                                        'is_active'
                                    ] ?? true
                                ),

                            'sort_order' =>
                                (int) (
                                    $itemData[
                                        'sort_order'
                                    ] ?? 0
                                ),
                        ];

                        if ($item) {
                            $item->update(
                                $itemValues
                            );

                            $result[
                                'items_updated'
                            ]++;
                        } else {
                            MenuItem::create(
                                $itemValues
                            );

                            $result[
                                'items_created'
                            ]++;
                        }
                    }
                }
            }
        );

        return $result;
    }

    private function normalizeFoodType(
        mixed $foodType
    ): string {
        $value =
            strtolower(
                trim(
                    (string) $foodType
                )
            );

        return match ($value) {
            'non-veg',
            'non_veg',
            'nonveg',
            'non veg' =>
                'non_veg',

            'egg',
            'eggetarian' =>
                'egg',

            default =>
                'veg',
        };
    }
}