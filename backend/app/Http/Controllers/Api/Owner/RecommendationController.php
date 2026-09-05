<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Recommendation;
use App\Models\RecommendationFeedback;
use App\Models\RecommendationGeneration;
use App\Services\Recommendations\RecommendationAiManager;
use App\Services\Recommendations\RecommendationDataService;
use App\Services\Recommendations\RecommendationEvidenceValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class RecommendationController extends Controller
{
        public function __construct(
        private readonly RecommendationDataService $dataService,
        private readonly RecommendationAiManager $aiManager,
        private readonly RecommendationEvidenceValidator $evidenceValidator
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Latest successful recommendations
    |--------------------------------------------------------------------------
    */

    public function index(
    Request $request
): JsonResponse {
    $restaurantId =
        $this->restaurantId(
            $request
        );

    if (!$restaurantId) {
        return response()->json([
            'success' => false,

            'message' =>
                'Restaurant not found for this owner.',
        ], 422);
    }
        $userId =
        (int)
            $request
                ->user()
                ->id;
    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    $request->validate([
        'page' => [
            'nullable',
            'integer',
            'min:1',
        ],

        'per_page' => [
            'nullable',
            'integer',
            'min:1',
            'max:20',
        ],
    ]);

    $page = max(
        1,
        (int) $request->query(
            'page',
            1
        )
    );

    $perPage = min(
        20,
        max(
            1,
            (int) $request->query(
                'per_page',
                5
            )
        )
    );

    /*
    |--------------------------------------------------------------------------
    | Successful generation history
    |--------------------------------------------------------------------------
    */

    $paginator =
        RecommendationGeneration::query()
            ->where(
                'restaurant_id',
                $restaurantId
            )
            ->where(
                'status',
                RecommendationGeneration::STATUS_COMPLETED
            )
                        ->with([
                'recommendations' =>
                    function (
                        $query
                    ) use (
                        $userId
                    ) {
                        $query
                            ->with([
                                'feedback' =>
                                    function (
                                        $feedbackQuery
                                    ) use (
                                        $userId
                                    ) {
                                        $feedbackQuery
                                            ->where(
                                                'user_id',
                                                $userId
                                            )
                                            ->latest(
                                                'id'
                                            );
                                    },
                            ])
                            ->orderByRaw(
                                "CASE priority
                                    WHEN 'high' THEN 1
                                    WHEN 'medium' THEN 2
                                    WHEN 'low' THEN 3
                                    ELSE 4
                                END"
                            )
                            ->orderByDesc(
                                'confidence'
                            )
                            ->orderBy('id');
                    },
            ])
            ->latest(
                'generated_at'
            )
            ->latest('id')
            ->paginate(
                $perPage,
                ['*'],
                'page',
                $page
            );

    $generations =
        $paginator
            ->getCollection()
            ->map(
                fn (
                    RecommendationGeneration $generation
                ) =>
                    $this->formatGeneration(
                        $generation
                    )
            )
            ->values()
            ->all();

    /*
    |--------------------------------------------------------------------------
    | Latest attempt including failed/pending
    |--------------------------------------------------------------------------
    */

    $latestAttempt =
        RecommendationGeneration::query()
            ->where(
                'restaurant_id',
                $restaurantId
            )
            ->latest('id')
            ->first([
                'id',
                'status',
                'generated_at',
                'failed_at',
                'failure_reason',
                'created_at',
            ]);

    return response()->json([
        'success' => true,

        'message' =>
            count($generations) > 0
                ? 'Recommendation history fetched successfully.'
                : 'No recommendations have been generated yet.',

        'data' => [
            /*
             * Backward compatibility:
             * existing frontend/tests can still read
             * data.generation.
             */

            'generation' =>
                $generations[0]
                ?? null,

            /*
             * Complete page of history:
             * newest generation first.
             */

            'generations' =>
                $generations,

            'pagination' => [
                'current_page' =>
                    $paginator
                        ->currentPage(),

                'last_page' =>
                    $paginator
                        ->lastPage(),

                'per_page' =>
                    $paginator
                        ->perPage(),

                'total' =>
                    $paginator
                        ->total(),

                'has_more' =>
                    $paginator
                        ->hasMorePages(),
            ],

            'latest_attempt' =>
                $latestAttempt,
        ],
    ]);
}

    /*
    |--------------------------------------------------------------------------
    | Generate new recommendations
    |--------------------------------------------------------------------------
    */

    public function generate(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if (
            !$user ||
            !$user->restaurant_id ||
            !$user->restaurant
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Restaurant not found for this owner.',
            ], 422);
        }

        $restaurantId =
            (int) $user->restaurant_id;

        /*
        |--------------------------------------------------------------------------
        | Recover stale pending attempts
        |--------------------------------------------------------------------------
        */

        RecommendationGeneration::query()
            ->where(
                'restaurant_id',
                $restaurantId
            )
            ->where(
                'status',
                RecommendationGeneration::STATUS_PENDING
            )
            ->where(
                'created_at',
                '<=',
                now()->subMinutes(5)
            )
            ->update([
                'status' =>
                    RecommendationGeneration::STATUS_FAILED,

                'failed_at' => now(),

                'failure_reason' =>
                    'Generation did not finish within the expected time.',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Prevent simultaneous AI requests
        |--------------------------------------------------------------------------
        */

        $alreadyGenerating =
            RecommendationGeneration::query()
                ->where(
                    'restaurant_id',
                    $restaurantId
                )
                ->where(
                    'status',
                    RecommendationGeneration::STATUS_PENDING
                )
                ->exists();

        if ($alreadyGenerating) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Recommendations are already being generated. Please wait.',

                'code' =>
                    'RECOMMENDATION_GENERATION_IN_PROGRESS',
            ], 409);
        }

        /*
        |--------------------------------------------------------------------------
        | Build anonymous restaurant analytics
        |--------------------------------------------------------------------------
        */

        try {
            $snapshot =
                $this->dataService->build(
                    $user->restaurant
                );
        } catch (Throwable $exception) {
            Log::error(
                'Recommendation analytics collection failed.',
                [
                    'user_id' => $user->id,

                    'restaurant_id' =>
                        $restaurantId,

                    'exception' =>
                        $exception,
                ]
            );

            return response()->json([
                'success' => false,

                'message' =>
                    'Unable to prepare restaurant analytics.',

                'code' =>
                    'RECOMMENDATION_DATA_FAILED',
            ], 500);
        }

        /*
        |--------------------------------------------------------------------------
        | Require enough data for a useful AI result
        |--------------------------------------------------------------------------
        */

        if (
            !data_get(
                $snapshot,
                'data_quality.has_enough_data',
                false
            )
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'At least 5 paid orders are required before generating recommendations.',

                'code' =>
                    'INSUFFICIENT_RECOMMENDATION_DATA',

                'data' => [
                    'paid_orders_available' =>
                        (int) data_get(
                            $snapshot,
                            'data_quality.paid_orders_available',
                            0
                        ),

                    'paid_orders_required' =>
                        5,
                ],
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Create pending generation
        |--------------------------------------------------------------------------
        */

        $generation =
            RecommendationGeneration::create([
                'restaurant_id' =>
                    $restaurantId,

                'status' =>
                    RecommendationGeneration::STATUS_PENDING,

                'period_start' =>
                    data_get(
                        $snapshot,
                        'period.start'
                    ),

                'period_end' =>
                    data_get(
                        $snapshot,
                        'period.end'
                    ),

                'model' =>
                    $this->aiManager
                        ->model(),

                'analytics_snapshot' =>
                    $snapshot,
            ]);

        try {
            /*
            |--------------------------------------------------------------------------
            | AI provider request
            |--------------------------------------------------------------------------
            */

            $aiResult =
                $this->aiManager
                    ->generate(
                        $snapshot
                    );

            /*
            |--------------------------------------------------------------------------
            | Verify AI evidence against actual snapshot
            |--------------------------------------------------------------------------
            */

            $aiResult[
                'recommendations'
            ] =
                $this
                    ->evidenceValidator
                    ->validate(
                        $aiResult[
                            'recommendations'
                        ],
                        $snapshot
                    );

            /*
            |--------------------------------------------------------------------------
            | Save successful result atomically
            |--------------------------------------------------------------------------
            */

            DB::transaction(
                function () use (
                    $generation,
                    $restaurantId,
                    $aiResult
                ) {
                    $generation->update([
                        'status' =>
                            RecommendationGeneration::STATUS_COMPLETED,

                        'model' =>
                            $aiResult['model'],

                        'summary' =>
                            $aiResult['summary'],

                        'input_tokens' =>
                            data_get(
                                $aiResult,
                                'usage.input_tokens'
                            ),

                        'output_tokens' =>
                            data_get(
                                $aiResult,
                                'usage.output_tokens'
                            ),

                        'generated_at' =>
                            now(),

                        'failed_at' =>
                            null,

                        'failure_reason' =>
                            null,
                    ]);

                    foreach (
                        $aiResult[
                            'recommendations'
                        ] as $item
                    ) {
                        $generation
                            ->recommendations()
                            ->create([
                                'restaurant_id' =>
                                    $restaurantId,

                                'category' =>
                                    $item['category'],

                                'priority' =>
                                    $item['priority'],

                                'confidence' =>
                                    $item['confidence'],

                                'title' =>
                                    $item['title'],

                                'description' =>
                                    $item['description'],

                                'problem' =>
                                    $item['problem'],

                                'solution' =>
                                    $item['solution'],

                                'expected_impact' =>
                                    $item[
                                        'expected_impact'
                                    ],
                                'evidence' =>
                                    $item[
                                        'evidence'
                                    ],

                                'status' =>
                                    Recommendation::STATUS_ACTIVE,
                            ]);
                    }
                }
            );

            $generation->load([
                'recommendations' =>
                    function ($query) {
                        $query
                            ->orderByRaw(
                                "CASE priority
                                    WHEN 'high' THEN 1
                                    WHEN 'medium' THEN 2
                                    WHEN 'low' THEN 3
                                    ELSE 4
                                END"
                            )
                            ->orderByDesc(
                                'confidence'
                            )
                            ->orderBy('id');
                    },
            ]);

            return response()->json([
                'success' => true,

                'message' =>
                    'AI recommendations generated successfully.',

                'data' => [
                    'generation' =>
                        $this->formatGeneration(
                            $generation
                        ),
                ],
            ], 201);
        } catch (Throwable $exception) {
            $generation->update([
                'status' =>
                    RecommendationGeneration::STATUS_FAILED,

                'failed_at' =>
                    now(),

                'failure_reason' =>
                    Str::limit(
                        $exception->getMessage(),
                        2000
                    ),
            ]);

            Log::error(
                'AI recommendation generation failed.',
                [
                    'user_id' =>
                        $user->id,

                    'restaurant_id' =>
                        $restaurantId,

                    'generation_id' =>
                        $generation->id,

                    'exception' =>
                        $exception,
                ]
            );

                        return $this
                ->generationFailureResponse(
                    $exception
                );
        }
    }

        /*
    |--------------------------------------------------------------------------
    | Save or update recommendation feedback
    |--------------------------------------------------------------------------
    */

    public function storeFeedback(
        Request $request,
        Recommendation $recommendation
    ): JsonResponse {
        $user =
            $request->user();

        if (
            !$user ||
            !$user->restaurant_id ||
            (int)
                $recommendation
                    ->restaurant_id !==
                (int)
                    $user
                        ->restaurant_id
        ) {
            /*
             * Return 404 so one restaurant cannot
             * discover another restaurant's
             * recommendation IDs.
             */

            return response()->json([
                'success' => false,

                'message' =>
                    'Recommendation not found.',
            ], 404);
        }

        $validated =
            $request->validate([
                'feedback' => [
                    'required',
                    'string',
                    'in:useful,not_useful',
                ],
            ]);

        $feedback =
            RecommendationFeedback::updateOrCreate(
                [
                    'recommendation_id' =>
                        $recommendation->id,

                    'user_id' =>
                        $user->id,
                ],
                [
                    'restaurant_id' =>
                        $user
                            ->restaurant_id,

                    'feedback' =>
                        $validated[
                            'feedback'
                        ],
                ]
            );

        return response()->json([
            'success' => true,

            'message' =>
                'Recommendation feedback saved successfully.',

            'data' => [
                'feedback' => [
                    'id' =>
                        $feedback->id,

                    'recommendation_id' =>
                        $feedback
                            ->recommendation_id,

                    'value' =>
                        $feedback
                            ->feedback,

                    'updated_at' =>
                        $feedback
                            ->updated_at
                            ?->toIso8601String(),
                ],
            ],
        ]);
    }

        /**
     * Return a safe and useful AI failure response.
     */
    private function generationFailureResponse(
        Throwable $exception
    ): JsonResponse {
        $message =
            strtolower(
                $exception->getMessage()
            );

        if (
            str_contains(
                $message,
                'http 429'
            ) ||
            str_contains(
                $message,
                'rate limit'
            ) ||
            str_contains(
                $message,
                'quota'
            )
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'AI generation limit has been reached. Please try again later.',

                'code' =>
                    'AI_PROVIDER_RATE_LIMITED',
            ], 429);
        }

        if (
            str_contains(
                $message,
                'http 503'
            ) ||
            str_contains(
                $message,
                'high demand'
            ) ||
            str_contains(
                $message,
                'service unavailable'
            )
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'AI service is temporarily busy. Your previous recommendations are still available. Please try again shortly.',

                'code' =>
                    'AI_PROVIDER_UNAVAILABLE',
            ], 503);
        }

        if (
            str_contains(
                $message,
                'timed out'
            ) ||
            str_contains(
                $message,
                'timeout'
            ) ||
            str_contains(
                $message,
                'curl error 28'
            )
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'AI generation took too long. Your previous recommendations are still available. Please try again.',

                'code' =>
                    'AI_PROVIDER_TIMEOUT',
            ], 504);
        }

        return response()->json([
            'success' => false,

            'message' =>
                'Unable to generate AI recommendations. Your previous recommendations are still available.',

            'code' =>
                'RECOMMENDATION_GENERATION_FAILED',
        ], 502);
    }

    private function restaurantId(
        Request $request
    ): ?int {
        $restaurantId =
            $request->user()
                ?->restaurant_id;

        return $restaurantId
            ? (int) $restaurantId
            : null;
    }

    private function formatGeneration(
        ?RecommendationGeneration $generation
    ): ?array {
        if (!$generation) {
            return null;
        }

        return [
            'id' =>
                $generation->id,

            'status' =>
                $generation->status,

            'period_start' =>
                $generation
                    ->period_start
                    ?->toDateString(),

            'period_end' =>
                $generation
                    ->period_end
                    ?->toDateString(),

            'model' =>
                $generation->model,

            'summary' =>
                $generation->summary,

            'generated_at' =>
                $generation
                    ->generated_at
                    ?->toIso8601String(),

            'recommendations' =>
                $generation
                    ->recommendations
                    ->map(
                        fn (
                            Recommendation $item
                        ) => [
                            'id' =>
                                $item->id,

                            'category' =>
                                $item->category,

                            'priority' =>
                                $item->priority,

                            'confidence' =>
                                $item->confidence,

                            'title' =>
                                $item->title,

                            'description' =>
                                $item->description,

                            'problem' =>
                                $item->problem,

                            'solution' =>
                                $item->solution,

                            'expected_impact' =>
                                $item
                                    ->expected_impact,

                                                'evidence' =>
                                $item->evidence
                                ?? [],

                            'evidence_verified' =>
                                is_array(
                                    $item->evidence
                                ) &&
                                count(
                                    $item->evidence
                                ) > 0,

                            'status' =>
                                $item->status,

                                                            'user_feedback' =>
                                $item
                                    ->relationLoaded(
                                        'feedback'
                                    )
                                    ? $item
                                        ->feedback
                                        ->first()
                                        ?->feedback
                                    : null,
                        ]
                    )
                    ->values()
                    ->all(),
        ];
    }
}