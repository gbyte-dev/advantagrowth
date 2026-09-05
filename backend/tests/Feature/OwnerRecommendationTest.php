<?php

namespace Tests\Feature;

use App\Models\Recommendation;
use App\Models\RecommendationGeneration;
use App\Models\Restaurant;
use App\Models\RestaurantSubscription;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Recommendations\RecommendationAiManager;
use App\Services\Recommendations\RecommendationDataService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class OwnerRecommendationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(
            '2026-09-03 10:00:00'
        );
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function createOwner(
        string $suffix = 'one'
    ): array {
        $restaurant =
            Restaurant::create([
                'name' =>
                    "Recommendation Restaurant {$suffix}",

                'slug' =>
                    "recommendation-restaurant-{$suffix}",

                'phone' =>
                    "90000000{$suffix}",

                'email' =>
                    "recommendation-restaurant-{$suffix}@example.com",

                'currency' =>
                    'INR',

                'timezone' =>
                    'UTC',

                'is_active' =>
                    true,
            ]);

        $user =
            User::create([
                'restaurant_id' =>
                    $restaurant->id,

                'owner_name' =>
                    "Recommendation Owner {$suffix}",

                'email' =>
                    "recommendation-owner-{$suffix}@example.com",

                'phone' =>
                    "80000000{$suffix}",

                'password' =>
                    bcrypt(
                        'password123'
                    ),
            ]);

        $plan =
            Subscription::create([
                'name' =>
                    "Recommendation Plan {$suffix}",

                'slug' =>
                    "recommendation-plan-{$suffix}",

                'price' =>
                    19.99,

                'currency' =>
                    'INR',

                'interval' =>
                    'month',

                'interval_count' =>
                    1,

                'is_active' =>
                    true,

                'description' =>
                    'Recommendation test subscription.',
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

        return [
            $restaurant,
            $user,
        ];
    }

    private function createRecommendation(
        Restaurant $restaurant,
        string $suffix = 'one'
    ): Recommendation {
        $generation =
            RecommendationGeneration::create([
                'restaurant_id' =>
                    $restaurant->id,

                'status' =>
                    RecommendationGeneration::STATUS_COMPLETED,

                'period_start' =>
                    '2026-08-05',

                'period_end' =>
                    '2026-09-03',

                'model' =>
                    'gemini-3.6-flash',

                'summary' => [
                    'headline' =>
                        "Feedback headline {$suffix}",

                    'overview' =>
                        "Feedback overview {$suffix}",

                    'focus_area' =>
                        'Operations',
                ],

                'generated_at' =>
                    now(),
            ]);

        return $generation
            ->recommendations()
            ->create([
                'restaurant_id' =>
                    $restaurant->id,

                'category' =>
                    'Operations',

                'priority' =>
                    'high',

                'confidence' =>
                    85,

                'title' =>
                    "Feedback recommendation {$suffix}",

                'description' =>
                    'Feedback recommendation description.',

                'problem' =>
                    'Feedback recommendation problem.',

                'solution' =>
                    'Feedback recommendation solution.',

                'expected_impact' =>
                    'Feedback recommendation impact.',

                'status' =>
                    Recommendation::STATUS_ACTIVE,
            ]);
    }

    private function analyticsSnapshot(
        bool $hasEnoughData = true
    ): array {
        return [
            'period' => [
                'start' =>
                    '2026-08-05',

                'end' =>
                    '2026-09-03',

                'days' =>
                    30,
            ],

            'summary' => [
                'orders' =>
                    $hasEnoughData
                        ? 7
                        : 2,

                'revenue' =>
                    $hasEnoughData
                        ? 2687.00
                        : 400.00,

                'average_order_value' =>
                    $hasEnoughData
                        ? 383.86
                        : 200.00,

                'revenue_change_percent' =>
                    25.5,

                'orders_change_percent' =>
                    16.7,

                'average_order_value_change_percent' =>
                    7.5,
            ],

            'previous_period_summary' => [
                'orders' =>
                    6,

                'revenue' =>
                    2140.00,

                'average_order_value' =>
                    356.67,
            ],

            'daily_revenue_trend' => [
                [
                    'date' =>
                        '2026-09-01',

                    'orders' =>
                        4,

                    'revenue' =>
                        1500.00,
                ],
                [
                    'date' =>
                        '2026-09-02',

                    'orders' =>
                        3,

                    'revenue' =>
                        1187.00,
                ],
            ],

            'weekday_demand' => [
                [
                    'weekday' =>
                        'Tuesday',

                    'orders' =>
                        3,

                    'revenue' =>
                        1187.00,
                ],
                [
                    'weekday' =>
                        'Wednesday',

                    'orders' =>
                        4,

                    'revenue' =>
                        1500.00,
                ],
            ],

            'top_products' => [
                [
                    'name' =>
                        'Cheeseburger',

                    'quantity' =>
                        6,

                    'revenue' =>
                        1194.00,
                ],
            ],

            'low_products' => [
                [
                    'name' =>
                        'Waffle Fries',

                    'quantity' =>
                        1,

                    'revenue' =>
                        120.00,
                ],
            ],

            'order_status' => [
                'pending' =>
                    0,

                'preparing' =>
                    0,

                'ready' =>
                    0,

                'completed' =>
                    5,

                'cancelled' =>
                    2,
            ],

            'payment_methods' => [
                [
                    'payment_method' =>
                        'card',

                    'orders' =>
                        7,

                    'revenue' =>
                        2687.00,
                ],
            ],

            'data_quality' => [
                'paid_orders_available' =>
                    $hasEnoughData
                        ? 7
                        : 2,

                'has_enough_data' =>
                    $hasEnoughData,
            ],
        ];
    }

    private function aiResult(): array
    {
        return [
            'response_id' =>
                'gemini-response-test',

            'request_id' =>
                'gemini-request-test',

            'model' =>
                'gemini-3.6-flash',

            'summary' => [
                'headline' =>
                    'Order completion requires attention.',

                'overview' =>
                    'Sales data indicates an opportunity to improve order completion.',

                'focus_area' =>
                    'Operations',
            ],

            'recommendations' => [
                [
                    'title' =>
                        'Reduce order cancellations',

                    'category' =>
                        'Operations',

                    'priority' =>
                        'high',

                    'confidence' =>
                        85,

                    'description' =>
                        'Cancelled orders are visible in the supplied analytics.',

                    'problem' =>
                        'Cancelled orders reduce completed sales.',

                    'solution' =>
                        'Review order handling and kitchen workflow.',

                    'expected_impact' =>
                        'More orders can reach completion.',
                                            'evidence' => [
                        [
                            'source_path' =>
                                'order_status.cancelled',

                            'label' =>
                                'Cancelled orders',

                            'value' =>
                                '2',
                        ],
                    ],
                ],
                [
                    'title' =>
                        'Promote the top-selling product',

                    'category' =>
                        'Marketing',

                    'priority' =>
                        'medium',

                    'confidence' =>
                        80,

                    'description' =>
                        'Cheeseburger leads the supplied product sales data.',

                    'problem' =>
                        'Other products have lower sales volume.',

                    'solution' =>
                        'Feature Cheeseburger with complementary menu items.',

                    'expected_impact' =>
                        'Improved visibility for complementary products.',
                                            'evidence' => [
                        [
                            'source_path' =>
                                'top_products.0.name',

                            'label' =>
                                'Top product',

                            'value' =>
                                'Cheeseburger',
                        ],
                    ],
                ],
                [
                    'title' =>
                        'Review low-selling products',

                    'category' =>
                        'Menu',

                    'priority' =>
                        'low',

                    'confidence' =>
                        75,

                    'description' =>
                        'Waffle Fries has low sales in the supplied period.',

                    'problem' =>
                        'The item receives limited customer demand.',

                    'solution' =>
                        'Review its placement, pricing, and presentation.',

                    'expected_impact' =>
                        'A clearer and more effective menu.',
                                            'evidence' => [
                        [
                            'source_path' =>
                                'low_products.0.name',

                            'label' =>
                                'Low-selling product',

                            'value' =>
                                'Waffle Fries',
                        ],
                    ],
                ],
            ],

            'usage' => [
                'input_tokens' =>
                    800,

                'output_tokens' =>
                    500,

                'total_tokens' =>
                    1300,
            ],
        ];
    }

    public function test_owner_sees_empty_state_before_first_generation(): void
    {
        [, $user] =
            $this->createOwner();

        Sanctum::actingAs(
            $user
        );

        $this->getJson(
            '/api/owner/recommendations'
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.generation',
                null
            )
            ->assertJsonPath(
                'data.latest_attempt',
                null
            );
    }

    public function test_generation_requires_at_least_five_paid_orders(): void
    {
        [, $user] =
            $this->createOwner(
                'insufficient'
            );

        $snapshot =
            $this->analyticsSnapshot(
                false
            );

        $dataService =
            Mockery::mock(
                RecommendationDataService::class
            );

        $dataService
            ->shouldReceive('build')
            ->once()
            ->andReturn(
                $snapshot
            );

        $aiManager =
            Mockery::mock(
                RecommendationAiManager::class
            );

        $aiManager
            ->shouldNotReceive(
                'model'
            );

        $aiManager
            ->shouldNotReceive(
                'generate'
            );

        $this->app->instance(
            RecommendationDataService::class,
            $dataService
        );

        $this->app->instance(
            RecommendationAiManager::class,
            $aiManager
        );

        Sanctum::actingAs(
            $user
        );

        $this->postJson(
            '/api/owner/recommendations/generate'
        )
            ->assertStatus(422)
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'code',
                'INSUFFICIENT_RECOMMENDATION_DATA'
            )
            ->assertJsonPath(
                'data.paid_orders_available',
                2
            )
            ->assertJsonPath(
                'data.paid_orders_required',
                5
            );

        $this->assertDatabaseCount(
            'recommendation_generations',
            0
        );

        $this->assertDatabaseCount(
            'recommendations',
            0
        );
    }

    public function test_owner_can_generate_and_save_ai_recommendations(): void
    {
        [$restaurant, $user] =
            $this->createOwner(
                'success'
            );

        $snapshot =
            $this->analyticsSnapshot();

        $aiResult =
            $this->aiResult();

        $dataService =
            Mockery::mock(
                RecommendationDataService::class
            );

        $dataService
            ->shouldReceive('build')
            ->once()
            ->andReturn(
                $snapshot
            );

        $aiManager =
            Mockery::mock(
                RecommendationAiManager::class
            );

        $aiManager
            ->shouldReceive('model')
            ->once()
            ->andReturn(
                'gemini-3.6-flash'
            );

        $aiManager
            ->shouldReceive('generate')
            ->once()
            ->with(
                $snapshot
            )
            ->andReturn(
                $aiResult
            );

        $this->app->instance(
            RecommendationDataService::class,
            $dataService
        );

        $this->app->instance(
            RecommendationAiManager::class,
            $aiManager
        );

        Sanctum::actingAs(
            $user
        );

        $response =
            $this->postJson(
                '/api/owner/recommendations/generate'
            );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.generation.status',
                'completed'
            )
            ->assertJsonPath(
                'data.generation.model',
                'gemini-3.6-flash'
            )
            ->assertJsonPath(
                'data.generation.summary.focus_area',
                'Operations'
            )
            ->assertJsonCount(
                3,
                'data.generation.recommendations'
            )
            ->assertJsonPath(
                'data.generation.recommendations.0.title',
                'Reduce order cancellations'
            );

        $this->assertDatabaseHas(
            'recommendation_generations',
            [
                'restaurant_id' =>
                    $restaurant->id,

                'status' =>
                    RecommendationGeneration::STATUS_COMPLETED,

                'model' =>
                    'gemini-3.6-flash',

                'input_tokens' =>
                    800,

                'output_tokens' =>
                    500,
            ]
        );

        $this->assertDatabaseCount(
            'recommendations',
            3
        );

        $this->assertDatabaseHas(
            'recommendations',
            [
                'restaurant_id' =>
                    $restaurant->id,

                'title' =>
                    'Reduce order cancellations',

                'category' =>
                    'Operations',

                'priority' =>
                    'high',

                'confidence' =>
                    85,

                'status' =>
                    Recommendation::STATUS_ACTIVE,
            ]
        );
    }

    public function test_failed_ai_request_is_recorded_safely(): void
    {
        [$restaurant, $user] =
            $this->createOwner(
                'failure'
            );

        $snapshot =
            $this->analyticsSnapshot();

        $dataService =
            Mockery::mock(
                RecommendationDataService::class
            );

        $dataService
            ->shouldReceive('build')
            ->once()
            ->andReturn(
                $snapshot
            );

        $aiManager =
            Mockery::mock(
                RecommendationAiManager::class
            );

        $aiManager
            ->shouldReceive('model')
            ->once()
            ->andReturn(
                'gemini-3.6-flash'
            );

        $aiManager
            ->shouldReceive('generate')
            ->once()
            ->andThrow(
                new RuntimeException(
                    'Temporary AI provider failure.'
                )
            );

        $this->app->instance(
            RecommendationDataService::class,
            $dataService
        );

        $this->app->instance(
            RecommendationAiManager::class,
            $aiManager
        );

        Sanctum::actingAs(
            $user
        );

        $this->postJson(
            '/api/owner/recommendations/generate'
        )
            ->assertStatus(502)
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'code',
                'RECOMMENDATION_GENERATION_FAILED'
            );

        $this->assertDatabaseHas(
            'recommendation_generations',
            [
                'restaurant_id' =>
                    $restaurant->id,

                'status' =>
                    RecommendationGeneration::STATUS_FAILED,

                'model' =>
                    'gemini-3.6-flash',

                'failure_reason' =>
                    'Temporary AI provider failure.',
            ]
        );

        $this->assertDatabaseCount(
            'recommendations',
            0
        );
    }

    public function test_owner_only_receives_own_latest_completed_generation(): void
    {
        [$restaurant, $user] =
            $this->createOwner(
                'primary'
            );

        [$otherRestaurant] =
            $this->createOwner(
                'other'
            );

        $ownGeneration =
            RecommendationGeneration::create([
                'restaurant_id' =>
                    $restaurant->id,

                'status' =>
                    RecommendationGeneration::STATUS_COMPLETED,

                'period_start' =>
                    '2026-08-05',

                'period_end' =>
                    '2026-09-03',

                'model' =>
                    'gemini-3.6-flash',

                'summary' => [
                    'headline' =>
                        'Owner headline',

                    'overview' =>
                        'Owner overview',

                    'focus_area' =>
                        'Operations',
                ],

                'generated_at' =>
                    now()->subMinute(),
            ]);

        $ownGeneration
            ->recommendations()
            ->create([
                'restaurant_id' =>
                    $restaurant->id,

                'category' =>
                    'Operations',

                'priority' =>
                    'high',

                'confidence' =>
                    90,

                'title' =>
                    'Owner recommendation',

                'description' =>
                    'Owner description',

                'problem' =>
                    'Owner problem',

                'solution' =>
                    'Owner solution',

                'expected_impact' =>
                    'Owner impact',

                'status' =>
                    Recommendation::STATUS_ACTIVE,
            ]);

        $otherGeneration =
            RecommendationGeneration::create([
                'restaurant_id' =>
                    $otherRestaurant->id,

                'status' =>
                    RecommendationGeneration::STATUS_COMPLETED,

                'period_start' =>
                    '2026-08-05',

                'period_end' =>
                    '2026-09-03',

                'model' =>
                    'gemini-3.6-flash',

                'summary' => [
                    'headline' =>
                        'Other headline',

                    'overview' =>
                        'Other overview',

                    'focus_area' =>
                        'Marketing',
                ],

                'generated_at' =>
                    now(),
            ]);

        $otherGeneration
            ->recommendations()
            ->create([
                'restaurant_id' =>
                    $otherRestaurant->id,

                'category' =>
                    'Marketing',

                'priority' =>
                    'high',

                'confidence' =>
                    95,

                'title' =>
                    'Other restaurant recommendation',

                'description' =>
                    'Other description',

                'problem' =>
                    'Other problem',

                'solution' =>
                    'Other solution',

                'expected_impact' =>
                    'Other impact',

                'status' =>
                    Recommendation::STATUS_ACTIVE,
            ]);

        Sanctum::actingAs(
            $user
        );

        $this->getJson(
            '/api/owner/recommendations'
        )
            ->assertOk()
            ->assertJsonPath(
                'data.generation.id',
                $ownGeneration->id
            )
            ->assertJsonPath(
                'data.generation.summary.headline',
                'Owner headline'
            )
            ->assertJsonPath(
                'data.generation.recommendations.0.title',
                'Owner recommendation'
            )
            ->assertJsonMissing([
                'title' =>
                    'Other restaurant recommendation',
            ]);
    }

        public function test_owner_can_save_recommendation_feedback(): void
    {
        [$restaurant, $user] =
            $this->createOwner(
                'fs'
            );

        $recommendation =
            $this->createRecommendation(
                $restaurant,
                'fs'
            );

        Sanctum::actingAs(
            $user
        );

        $this->putJson(
            "/api/owner/recommendations/{$recommendation->id}/feedback",
            [
                'feedback' =>
                    'useful',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.feedback.recommendation_id',
                $recommendation->id
            )
            ->assertJsonPath(
                'data.feedback.value',
                'useful'
            );

        $this->assertDatabaseHas(
            'recommendation_feedback',
            [
                'restaurant_id' =>
                    $restaurant->id,

                'recommendation_id' =>
                    $recommendation->id,

                'user_id' =>
                    $user->id,

                'feedback' =>
                    'useful',
            ]
        );

        /*
         * Saved feedback must be returned
         * with recommendation history.
         */

        $this->getJson(
            '/api/owner/recommendations'
        )
            ->assertOk()
            ->assertJsonPath(
                'data.generation.recommendations.0.user_feedback',
                'useful'
            );
    }

    public function test_repeated_feedback_updates_the_existing_record(): void
    {
        [$restaurant, $user] =
            $this->createOwner(
                'fu'
            );

        $recommendation =
            $this->createRecommendation(
                $restaurant,
                'fu'
            );

        Sanctum::actingAs(
            $user
        );

        $url =
            "/api/owner/recommendations/{$recommendation->id}/feedback";

        $this->putJson(
            $url,
            [
                'feedback' =>
                    'useful',
            ]
        )->assertOk();

        $this->putJson(
            $url,
            [
                'feedback' =>
                    'not_useful',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'data.feedback.value',
                'not_useful'
            );

        $this->assertDatabaseCount(
            'recommendation_feedback',
            1
        );

        $this->assertDatabaseHas(
            'recommendation_feedback',
            [
                'recommendation_id' =>
                    $recommendation->id,

                'user_id' =>
                    $user->id,

                'feedback' =>
                    'not_useful',
            ]
        );
    }

    public function test_owner_cannot_feedback_on_another_restaurants_recommendation(): void
    {
        [, $user] =
            $this->createOwner(
                'fp'
            );

        [$otherRestaurant] =
            $this->createOwner(
                'fo'
            );

        $otherRecommendation =
            $this->createRecommendation(
                $otherRestaurant,
                'fo'
            );

        Sanctum::actingAs(
            $user
        );

        $this->putJson(
            "/api/owner/recommendations/{$otherRecommendation->id}/feedback",
            [
                'feedback' =>
                    'useful',
            ]
        )
            ->assertNotFound()
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'message',
                'Recommendation not found.'
            );

        $this->assertDatabaseCount(
            'recommendation_feedback',
            0
        );
    }

}