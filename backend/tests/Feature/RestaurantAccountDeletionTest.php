<?php

namespace Tests\Feature;

use App\Models\RecommendationGeneration;
use App\Models\Restaurant;
use App\Models\RestaurantSubscription;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RestaurantAccountDeletionTest extends TestCase
{
    use RefreshDatabase;

    private function createRestaurantOwner(
        string $suffix
    ): array {
        $restaurant =
            Restaurant::create([
                'name' =>
                    "Deletion Restaurant {$suffix}",

                'slug' =>
                    "deletion-restaurant-{$suffix}",

                'phone' =>
                    "90000000{$suffix}",

                'email' =>
                    "deletion-restaurant-{$suffix}@example.com",

                'currency' =>
                    'INR',

                'timezone' =>
                    'UTC',

                'is_active' =>
                    true,
            ]);

        $owner =
            User::create([
                'restaurant_id' =>
                    $restaurant->id,

                'owner_name' =>
                    "Deletion Owner {$suffix}",

                'email' =>
                    "deletion-owner-{$suffix}@example.com",

                'phone' =>
                    "80000000{$suffix}",

                'password' =>
                    Hash::make(
                        'password123'
                    ),

                'role' =>
                    'owner',

                'is_active' =>
                    true,
            ]);

        $owner->forceFill([
            'email_verified_at' =>
                now(),
        ])->save();

        return [
            $restaurant,
            $owner,
        ];
    }

    private function addActiveSubscription(
        Restaurant $restaurant,
        string $suffix
    ): void {
        $plan =
            Subscription::create([
                'name' =>
                    "Deletion Plan {$suffix}",

                'slug' =>
                    "deletion-plan-{$suffix}",

                'price' =>
                    0,

                'currency' =>
                    'INR',

                'interval' =>
                    'month',

                'interval_count' =>
                    1,

                'is_active' =>
                    true,

                'description' =>
                    'Account deletion test plan.',
            ]);

        RestaurantSubscription::create([
            'restaurant_id' =>
                $restaurant->id,

            'subscription_id' =>
                $plan->id,

            'status' =>
                'active',

            'starts_at' =>
                now()->subDay(),

            'expires_at' =>
                now()->addMonth(),

            'cancelled_at' =>
                null,

            'auto_renew' =>
                false,
        ]);
    }

    public function test_deleting_owner_account_deletes_restaurant_and_related_data(): void
    {
        [$restaurant, $owner] =
            $this->createRestaurantOwner(
                'one'
            );

        $this->addActiveSubscription(
            $restaurant,
            'one'
        );

        $staff =
            User::create([
                'restaurant_id' =>
                    $restaurant->id,

                'owner_name' =>
                    'Deletion Staff',

                'email' =>
                    'deletion-staff@example.com',

                'phone' =>
                    '7000000001',

                'password' =>
                    Hash::make(
                        'password123'
                    ),

                'username' =>
                    'DELETE-STAFF-1',

                'role' =>
                    'staff',

                'staff_role' =>
                    'manager',

                'is_active' =>
                    true,
            ]);

        $generation =
            RecommendationGeneration::create([
                'restaurant_id' =>
                    $restaurant->id,

                'status' =>
                    RecommendationGeneration::
                        STATUS_COMPLETED,

                'period_start' =>
                    now()->subDays(30)->toDateString(),

                'period_end' =>
                    now()->toDateString(),

                'model' =>
                    'deletion-test-model',

                'summary' => [
                    'headline' =>
                        'Deletion test',

                    'overview' =>
                        'Deletion test overview',

                    'focus_area' =>
                        'Operations',
                ],

                'generated_at' =>
                    now(),
            ]);

        $ownerToken =
            $owner->createToken(
                'owner-delete-test'
            );

        $staffToken =
            $staff->createToken(
                'staff-delete-test'
            );

        $ownerTokenId =
            $ownerToken
                ->accessToken
                ->id;

        $staffTokenId =
            $staffToken
                ->accessToken
                ->id;

        $subscriptionId =
            RestaurantSubscription::query()
                ->where(
                    'restaurant_id',
                    $restaurant->id
                )
                ->value('id');

        $this
            ->withToken(
                $ownerToken
                    ->plainTextToken
            )
            ->deleteJson(
                '/api/auth/account'
            )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'message',
                'Restaurant account and all related data deleted successfully.'
            );

        $this->assertDatabaseMissing(
            'restaurants',
            [
                'id' =>
                    $restaurant->id,
            ]
        );

        $this->assertDatabaseMissing(
            'users',
            [
                'id' =>
                    $owner->id,
            ]
        );

        $this->assertDatabaseMissing(
            'users',
            [
                'id' =>
                    $staff->id,
            ]
        );

        $this->assertDatabaseMissing(
            'personal_access_tokens',
            [
                'id' =>
                    $ownerTokenId,
            ]
        );

        $this->assertDatabaseMissing(
            'personal_access_tokens',
            [
                'id' =>
                    $staffTokenId,
            ]
        );

        $this->assertDatabaseMissing(
            'restaurant_subscriptions',
            [
                'id' =>
                    $subscriptionId,
            ]
        );

        $this->assertDatabaseMissing(
            'recommendation_generations',
            [
                'id' =>
                    $generation->id,
            ]
        );
    }

    public function test_deleting_one_restaurant_does_not_delete_another_restaurant(): void
    {
        [$deletedRestaurant, $deletedOwner] =
            $this->createRestaurantOwner(
                'two'
            );

        [$safeRestaurant, $safeOwner] =
            $this->createRestaurantOwner(
                'three'
            );

        $this->addActiveSubscription(
            $deletedRestaurant,
            'two'
        );

        $deletedOwnerToken =
            $deletedOwner->createToken(
                'delete-owner'
            );

        $this
            ->withToken(
                $deletedOwnerToken
                    ->plainTextToken
            )
            ->deleteJson(
                '/api/auth/account'
            )
            ->assertOk();

        $this->assertDatabaseMissing(
            'restaurants',
            [
                'id' =>
                    $deletedRestaurant->id,
            ]
        );

        $this->assertDatabaseHas(
            'restaurants',
            [
                'id' =>
                    $safeRestaurant->id,
            ]
        );

        $this->assertDatabaseHas(
            'users',
            [
                'id' =>
                    $safeOwner->id,

                'restaurant_id' =>
                    $safeRestaurant->id,
            ]
        );
    }
}