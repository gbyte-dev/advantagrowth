<?php

namespace App\Services\Recommendations;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use JsonException;
use RuntimeException;
use Illuminate\Http\Client\RequestException;


class GeminiRecommendationService
{
    /**
     * Generate AI recommendations using Gemini.
     */
    public function generate(array $snapshot): array
    {
        $apiKey = trim(
            (string) config(
                'services.gemini.api_key'
            )
        );

        $model = trim(
            (string) config(
                'services.gemini.model',
                'gemini-3.6-flash'
            )
        );

        $timeout = max(
            30,
            (int) config(
                'services.gemini.timeout',
                180
            )
        );

        if ($apiKey === '') {
            throw new RuntimeException(
                'Gemini API key is not configured.'
            );
        }

        if ($model === '') {
            throw new RuntimeException(
                'Gemini model is not configured.'
            );
        }

        $endpoint = sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent',
            rawurlencode($model)
        );

        $response = Http::withHeaders([
            'x-goog-api-key' => $apiKey,
        ])
            ->acceptJson()
            ->asJson()
            ->connectTimeout(15)
            ->timeout($timeout)
            ->retry(
                [
                    2000,
                    5000,
                ],
                function (
                    \Exception $exception
                ): bool {
                    if (
                        !$exception instanceof
                            RequestException
                    ) {
                        return false;
                    }

                    return in_array(
                        $exception
                            ->response
                            ->status(),
                        [
                            429,
                            500,
                            502,
                            503,
                            504,
                        ],
                        true
                    );
                },
                throw: false
            )
            ->post(
                $endpoint,
                [
                    'systemInstruction' => [
                        'parts' => [
                            [
                                'text' =>
                                    $this->systemInstructions(),
                            ],
                        ],
                    ],

                    'contents' => [
                        [
                            'role' => 'user',

                            'parts' => [
                                [
                                    'text' =>
                                        $this->prepareInput(
                                            $snapshot
                                        ),
                                ],
                            ],
                        ],
                    ],

                    'generationConfig' => [
                        'responseMimeType' =>
                            'application/json',

                        'responseJsonSchema' =>
                            $this->outputSchema(),

                        'thinkingConfig' => [
                            'thinkingLevel' =>
                                'LOW',
                        ],

                        'maxOutputTokens' =>
                            8192,
                    ],
                ]
            );

        $this->ensureSuccessfulResponse(
            $response
        );

        $responseData =
            $response->json();

        if (!is_array($responseData)) {
            throw new RuntimeException(
                'Gemini returned an invalid response.'
            );
        }

        $this->ensureResponseWasNotBlocked(
            $responseData
        );

        $outputText =
            $this->extractOutputText(
                $responseData
            );

        $decoded =
            $this->decodeOutput(
                $outputText
            );

        $validated =
            $this->validateOutput(
                $decoded
            );

        return [
            'response_id' =>
                $responseData['responseId']
                ?? null,

            'request_id' =>
                $response->header(
                    'x-request-id'
                )
                ?? (
                    $responseData['responseId']
                    ?? null
                ),

            'model' =>
                $responseData['modelVersion']
                ?? $model,

            'summary' =>
                $validated['summary'],

            'recommendations' =>
                $validated[
                    'recommendations'
                ],

            'usage' => [
                'input_tokens' =>
                    $this->nullableInteger(
                        data_get(
                            $responseData,
                            'usageMetadata.promptTokenCount'
                        )
                    ),

                'output_tokens' =>
                    $this->nullableInteger(
                        data_get(
                            $responseData,
                            'usageMetadata.candidatesTokenCount'
                        )
                    ),

                'total_tokens' =>
                    $this->nullableInteger(
                        data_get(
                            $responseData,
                            'usageMetadata.totalTokenCount'
                        )
                    ),
            ],
        ];
    }

    /**
     * Convert analytics snapshot into the user prompt.
     */
    private function prepareInput(
        array $snapshot
    ): string {
        try {
            $analyticsJson =
                json_encode(
                    $snapshot,
                    JSON_PRETTY_PRINT
                    | JSON_UNESCAPED_SLASHES
                    | JSON_UNESCAPED_UNICODE
                    | JSON_THROW_ON_ERROR
                );
        } catch (JsonException $exception) {
            throw new RuntimeException(
                'Unable to encode restaurant analytics.',
                0,
                $exception
            );
        }

        return <<<PROMPT
Analyse the restaurant analytics snapshot below and generate practical recommendations.

Use only the supplied analytics data. Do not use outside facts and do not invent missing restaurant information.

RESTAURANT ANALYTICS SNAPSHOT:

{$analyticsJson}
PROMPT;
    }

    /**
     * Rules followed by the AI model.
     */
    private function systemInstructions(): string
    {
        return <<<PROMPT
You are an AI restaurant performance analyst for Advanta Growth.

Your job is to analyse the supplied restaurant analytics and produce practical, evidence-based recommendations for the restaurant owner.

Follow these rules strictly:

1. Use only the analytics supplied in the request.
2. Never invent orders, revenue, products, customers, ingredients, stock levels, profit margins, costs, percentages, dates, or business facts.
3. Do not claim that an item is profitable or high-margin unless margin or cost data is explicitly supplied.
4. Inventory recommendations must remain general unless actual inventory data is supplied.
5. Customer-retention claims must not be made unless customer-level retention data is supplied.
6. You may identify demand, revenue, order, product, weekday, status, and payment patterns only when they are visible in the supplied analytics.
7. Marketing recommendations may only reference products and sales patterns found in the supplied analytics.
8. Each recommendation must contain a specific problem, a practical solution, and a realistic expected impact.
9. Expected impact must remain qualitative unless the supplied analytics directly supports a numeric statement.
10. Return between 3 and 5 non-duplicate recommendations.
11. Confidence must reflect the amount and quality of available data.
12. Use concise, professional English suitable for a restaurant owner.
13. Do not include Markdown, code fences, commentary, or fields outside the required JSON structure.
PROMPT;
    }

    /**
     * Required structured response format.
     */
    private function outputSchema(): array
    {
        return [
            'type' => 'object',

            'additionalProperties' => false,

            'required' => [
                'summary',
                'recommendations',
            ],

            'properties' => [
                'summary' => [
                    'type' => 'object',

                    'additionalProperties' =>
                        false,

                    'required' => [
                        'headline',
                        'overview',
                        'focus_area',
                    ],

                    'properties' => [
                        'headline' => [
                            'type' => 'string',

                            'description' =>
                                'A short headline describing the main restaurant performance finding.',
                        ],

                        'overview' => [
                            'type' => 'string',

                            'description' =>
                                'A concise overview based only on the supplied analytics.',
                        ],

                        'focus_area' => [
                            'type' => 'string',

                            'description' =>
                                'The most important business area the owner should focus on.',
                        ],
                    ],
                ],

                'recommendations' => [
                    'type' => 'array',
                    'minItems' => 3,
                    'maxItems' => 5,

                    'items' => [
                        'type' => 'object',

                        'additionalProperties' =>
                            false,

                        'required' => [
                            'title',
                            'category',
                            'priority',
                            'confidence',
                            'description',
                            'problem',
                            'solution',
                            'expected_impact',
                        ],

                        'properties' => [
                            'title' => [
                                'type' => 'string',

                                'description' =>
                                    'A short action-oriented recommendation title.',
                            ],

                            'category' => [
                                'type' => 'string',

                                'enum' => [
                                    'Operations',
                                    'Menu',
                                    'Marketing',
                                    'Inventory',
                                ],
                            ],

                            'priority' => [
                                'type' => 'string',

                                'enum' => [
                                    'high',
                                    'medium',
                                    'low',
                                ],
                            ],

                            'confidence' => [
                                'type' => 'integer',
                                'minimum' => 0,
                                'maximum' => 100,

                                'description' =>
                                    'Confidence based on the amount and quality of supplied data.',
                            ],

                            'description' => [
                                'type' => 'string',

                                'description' =>
                                    'The analytics insight supporting this recommendation.',
                            ],

                            'problem' => [
                                'type' => 'string',

                                'description' =>
                                    'The specific business problem visible in the supplied analytics.',
                            ],

                            'solution' => [
                                'type' => 'string',

                                'description' =>
                                    'A practical action the restaurant owner can take.',
                            ],

                            'expected_impact' => [
                                'type' => 'string',

                                'description' =>
                                    'A realistic qualitative outcome without unsupported numbers.',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Handle Gemini HTTP errors.
     */
    private function ensureSuccessfulResponse(
        Response $response
    ): void {
        if ($response->successful()) {
            return;
        }

        $message =
            data_get(
                $response->json(),
                'error.message'
            );

        if (
            !is_string($message) ||
            trim($message) === ''
        ) {
            $message =
                $response->body();
        }

        $message =
            trim(
                strip_tags(
                    (string) $message
                )
            );

        if ($message === '') {
            $message =
                'Unknown Gemini API error.';
        }

        throw new RuntimeException(
            sprintf(
                'Gemini request failed with HTTP %d: %s',
                $response->status(),
                $message
            )
        );
    }

    /**
     * Check prompt blocking and candidate finish state.
     */
    private function ensureResponseWasNotBlocked(
        array $responseData
    ): void {
        $blockReason =
            data_get(
                $responseData,
                'promptFeedback.blockReason'
            );

        if (
            is_string($blockReason) &&
            $blockReason !== '' &&
            $blockReason !==
                'BLOCK_REASON_UNSPECIFIED'
        ) {
            throw new RuntimeException(
                'Gemini blocked the request. Reason: '
                . $blockReason
            );
        }

        $candidate =
            data_get(
                $responseData,
                'candidates.0'
            );

        if (!is_array($candidate)) {
            throw new RuntimeException(
                'Gemini returned no recommendation candidate.'
            );
        }

        $finishReason =
            data_get(
                $candidate,
                'finishReason'
            );

        $allowedReasons = [
            null,
            '',
            'STOP',
            'FINISH_REASON_UNSPECIFIED',
        ];

        if (
            !in_array(
                $finishReason,
                $allowedReasons,
                true
            )
        ) {
            throw new RuntimeException(
                'Gemini response was incomplete. Reason: '
                . $finishReason
            );
        }
    }

    /**
     * Extract generated JSON text from Gemini parts.
     */
    private function extractOutputText(
        array $responseData
    ): string {
        $parts =
            data_get(
                $responseData,
                'candidates.0.content.parts',
                []
            );

        if (!is_array($parts)) {
            throw new RuntimeException(
                'Gemini response does not contain output parts.'
            );
        }

        $texts = [];

        foreach ($parts as $part) {
            if (
                is_array($part) &&
                isset($part['text']) &&
                is_string($part['text'])
            ) {
                $texts[] =
                    $part['text'];
            }
        }

        $outputText =
            trim(
                implode(
                    '',
                    $texts
                )
            );

        if ($outputText === '') {
            throw new RuntimeException(
                'Gemini returned an empty recommendation response.'
            );
        }

        return $outputText;
    }

    /**
     * Decode the generated JSON.
     */
    private function decodeOutput(
        string $outputText
    ): array {
        /*
         * Defensive cleanup in case the model adds
         * a Markdown JSON code fence.
         */
        $outputText =
            preg_replace(
                '/^```(?:json)?\s*|\s*```$/i',
                '',
                trim($outputText)
            ) ?? trim($outputText);

        try {
            $decoded =
                json_decode(
                    $outputText,
                    true,
                    512,
                    JSON_THROW_ON_ERROR
                );
        } catch (JsonException $exception) {
            throw new RuntimeException(
                'Gemini returned invalid JSON: '
                . $exception->getMessage(),
                0,
                $exception
            );
        }

        if (!is_array($decoded)) {
            throw new RuntimeException(
                'Gemini recommendation output is not an object.'
            );
        }

        return $decoded;
    }

    /**
     * Validate AI output before saving it.
     */
    private function validateOutput(
        array $output
    ): array {
        $validator =
            Validator::make(
                $output,
                [
                    'summary' => [
                        'required',
                        'array',
                    ],

                    'summary.headline' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'summary.overview' => [
                        'required',
                        'string',
                        'max:2000',
                    ],

                    'summary.focus_area' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'recommendations' => [
                        'required',
                        'array',
                        'min:3',
                        'max:5',
                    ],

                    'recommendations.*.title' => [
                        'required',
                        'string',
                        'max:255',
                    ],

                    'recommendations.*.category' => [
                        'required',
                        'string',

                        Rule::in([
                            'Operations',
                            'Menu',
                            'Marketing',
                            'Inventory',
                        ]),
                    ],

                    'recommendations.*.priority' => [
                        'required',
                        'string',

                        Rule::in([
                            'high',
                            'medium',
                            'low',
                        ]),
                    ],

                    'recommendations.*.confidence' => [
                        'required',
                        'integer',
                        'between:0,100',
                    ],

                    'recommendations.*.description' => [
                        'required',
                        'string',
                        'max:2000',
                    ],

                    'recommendations.*.problem' => [
                        'required',
                        'string',
                        'max:2000',
                    ],

                    'recommendations.*.solution' => [
                        'required',
                        'string',
                        'max:2000',
                    ],

                    'recommendations.*.expected_impact' => [
                        'required',
                        'string',
                        'max:2000',
                    ],
                ]
            );

        if ($validator->fails()) {
            throw new RuntimeException(
                'Gemini recommendation validation failed: '
                . $validator
                    ->errors()
                    ->first()
            );
        }

        $validated =
            $validator->validated();

        $validated['summary'] = [
            'headline' =>
                trim(
                    $validated[
                        'summary'
                    ]['headline']
                ),

            'overview' =>
                trim(
                    $validated[
                        'summary'
                    ]['overview']
                ),

            'focus_area' =>
                trim(
                    $validated[
                        'summary'
                    ]['focus_area']
                ),
        ];

        $validated['recommendations'] =
            collect(
                $validated[
                    'recommendations'
                ]
            )
                ->map(
                    function (
                        array $recommendation
                    ): array {
                        return [
                            'title' =>
                                trim(
                                    $recommendation[
                                        'title'
                                    ]
                                ),

                            'category' =>
                                $recommendation[
                                    'category'
                                ],

                            'priority' =>
                                $recommendation[
                                    'priority'
                                ],

                            'confidence' =>
                                (int)
                                    $recommendation[
                                        'confidence'
                                    ],

                            'description' =>
                                trim(
                                    $recommendation[
                                        'description'
                                    ]
                                ),

                            'problem' =>
                                trim(
                                    $recommendation[
                                        'problem'
                                    ]
                                ),

                            'solution' =>
                                trim(
                                    $recommendation[
                                        'solution'
                                    ]
                                ),

                            'expected_impact' =>
                                trim(
                                    $recommendation[
                                        'expected_impact'
                                    ]
                                ),
                        ];
                    }
                )
                ->values()
                ->all();

        return $validated;
    }

    /**
     * Convert token values safely.
     */
    private function nullableInteger(
        mixed $value
    ): ?int {
        if (
            $value === null ||
            $value === ''
        ) {
            return null;
        }

        if (!is_numeric($value)) {
            return null;
        }

        return (int) $value;
    }
}