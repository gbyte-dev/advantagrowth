<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\RestaurantSubscription;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OwnerSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function createOwner(): array
    {
        $restaurant = Restaurant::create([
            'name' => 'Subscription Test Restaurant',
            'slug' => 'subscription-test-restaurant',
            'phone' => '9999999999',
            'email' => 'subscription-restaurant@example.com',
            'currency' => 'EUR',
            'timezone' => 'UTC',
            'is_active' => true,
        ]);

        $user = User::create([
            'restaurant_id' => $restaurant->id,
            'owner_name' => 'Subscription Test Owner',
            'email' => 'subscription-owner@example.com',
            'phone' => '9999999998',
            'password' => bcrypt('password123'),
        ]);

        return [$restaurant, $user];
    }

    private function createPlan(array $overrides = []): Subscription
    {
        return Subscription::create(array_merge([
            'name' => 'Starter Plan',
            'slug' => 'starter-plan',
            'price' => 0.00,
            'currency' => 'EUR',
            'interval' => 'month',
            'interval_count' => 1,
            'is_active' => true,
            'description' => 'Starter subscription plan.',
        ], $overrides));
    }

    public function test_owner_can_only_see_active_subscription_plans(): void
    {
        [, $user] = $this->createOwner();

        $activePlan = $this->createPlan();

        $this->createPlan([
            'name' => 'Inactive Plan',
            'slug' => 'inactive-plan',
            'is_active' => false,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson(
            '/api/owner/subscriptions'
        );

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'plans')
            ->assertJsonPath(
                'plans.0.id',
                $activePlan->id
            )
            ->assertJsonPath(
                'plans.0.name',
                'Starter Plan'
            )
            ->assertJsonPath(
                'current_subscription',
                null
            );
    }

    public function test_owner_can_activate_a_free_subscription_plan(): void
    {
        Carbon::setTestNow(
            '2026-08-31 10:00:00'
        );

        [$restaurant, $user] =
            $this->createOwner();

        $plan = $this->createPlan();

        Sanctum::actingAs($user);

        $response = $this->postJson(
            '/api/owner/subscriptions/subscribe',
            [
                'subscription_id' => $plan->id,
            ]
        );

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath(
                'data.restaurant_id',
                $restaurant->id
            )
            ->assertJsonPath(
                'data.subscription_id',
                $plan->id
            )
            ->assertJsonPath(
                'data.status',
                'active'
            )
            ->assertJsonPath(
                'data.subscription.name',
                'Starter Plan'
            );

        $this->assertDatabaseHas(
            'restaurant_subscriptions',
            [
                'restaurant_id' => $restaurant->id,
                'subscription_id' => $plan->id,
                'status' => 'active',
                'starts_at' => '2026-08-31 10:00:00',
                'expires_at' => '2026-09-30 10:00:00',
                'cancelled_at' => null,
                'auto_renew' => false,
            ]
        );
    }

    public function test_owner_cannot_activate_the_same_active_plan_twice(): void
    {
        [$restaurant, $user] =
            $this->createOwner();

        $plan = $this->createPlan();

        Sanctum::actingAs($user);

        $this->postJson(
            '/api/owner/subscriptions/subscribe',
            [
                'subscription_id' => $plan->id,
            ]
        )->assertCreated();

        $response = $this->postJson(
            '/api/owner/subscriptions/subscribe',
            [
                'subscription_id' => $plan->id,
            ]
        );

        $response
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath(
                'message',
                'This subscription plan is already active.'
            );

        $this->assertDatabaseCount(
            'restaurant_subscriptions',
            1
        );

        $this->assertDatabaseHas(
            'restaurant_subscriptions',
            [
                'restaurant_id' => $restaurant->id,
                'subscription_id' => $plan->id,
                'status' => 'active',
            ]
        );
    }

    public function test_switching_plan_cancels_old_subscription_and_keeps_history(): void
    {
        Carbon::setTestNow(
            '2026-08-31 10:00:00'
        );

        [$restaurant, $user] =
            $this->createOwner();

        $oldPlan = $this->createPlan();

        $newPlan = $this->createPlan([
            'name' => 'Growth Plan',
            'slug' => 'growth-plan',
            'price' => 0.00,
        ]);

        Sanctum::actingAs($user);

        $this->postJson(
            '/api/owner/subscriptions/subscribe',
            [
                'subscription_id' => $oldPlan->id,
            ]
        )->assertCreated();

        Carbon::setTestNow(
            '2026-09-01 12:00:00'
        );

        $this->postJson(
            '/api/owner/subscriptions/subscribe',
            [
                'subscription_id' => $newPlan->id,
            ]
        )
            ->assertCreated()
            ->assertJsonPath(
                'data.subscription_id',
                $newPlan->id
            )
            ->assertJsonPath(
                'data.status',
                'active'
            );

        $this->assertDatabaseCount(
            'restaurant_subscriptions',
            2
        );

        $this->assertDatabaseHas(
            'restaurant_subscriptions',
            [
                'restaurant_id' => $restaurant->id,
                'subscription_id' => $oldPlan->id,
                'status' => 'cancelled',
                'cancelled_at' => '2026-09-01 12:00:00',
            ]
        );

        $this->assertDatabaseHas(
            'restaurant_subscriptions',
            [
                'restaurant_id' => $restaurant->id,
                'subscription_id' => $newPlan->id,
                'status' => 'active',
                'starts_at' => '2026-09-01 12:00:00',
                'expires_at' => '2026-10-01 12:00:00',
                'cancelled_at' => null,
            ]
        );

        $this->assertSame(
            1,
            RestaurantSubscription::query()
                ->where(
                    'restaurant_id',
                    $restaurant->id
                )
                ->where('status', 'active')
                ->count()
        );
    }

    public function test_expired_active_subscription_is_automatically_marked_expired(): void
{
    Carbon::setTestNow(
        '2026-09-01 12:00:00'
    );

    [$restaurant, $user] =
        $this->createOwner();

    $plan = $this->createPlan();

    RestaurantSubscription::create([
        'restaurant_id' => $restaurant->id,
        'subscription_id' => $plan->id,
        'status' => 'active',
        'starts_at' => '2026-08-01 12:00:00',
        'expires_at' => '2026-09-01 11:59:59',
        'cancelled_at' => null,
        'auto_renew' => false,
    ]);

    Sanctum::actingAs($user);

    $this->getJson(
        '/api/owner/subscriptions'
    )
        ->assertOk()
        ->assertJsonPath(
            'current_subscription',
            null
        );

    $this->assertDatabaseHas(
        'restaurant_subscriptions',
        [
            'restaurant_id' => $restaurant->id,
            'subscription_id' => $plan->id,
            'status' => 'expired',
        ]
    );
}

public function test_paid_plan_cannot_be_activated_without_payment(): void
{
    [$restaurant, $user] =
        $this->createOwner();

    $plan = $this->createPlan([
        'name' => 'Paid Plan',
        'slug' => 'paid-plan',
        'price' => 19.99,
    ]);

    Sanctum::actingAs($user);

    $this->postJson(
        '/api/owner/subscriptions/subscribe',
        [
            'subscription_id' => $plan->id,
        ]
    )
        ->assertStatus(422)
        ->assertJsonPath(
            'success',
            false
        )
        ->assertJsonPath(
            'message',
            'Payment is required before activating this subscription plan.'
        );

    $this->assertDatabaseMissing(
        'restaurant_subscriptions',
        [
            'restaurant_id' =>
                $restaurant->id,

            'subscription_id' =>
                $plan->id,

            'status' => 'active',
        ]
    );
}

}