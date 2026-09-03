<?php

namespace App\Services\Recommendations;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use JsonException;
use RuntimeException;

class OpenAiRecommendationService
{
    public function generate(array $snapshot): array
    {
        $apiKey = trim(
            (string) config(
                'services.openai.api_key'
            )
        );

        $model = trim(
            (string) config(
                'services.openai.model'
            )
        );

        $timeout = max(
            30,
            (int) config(
                'services.openai.timeout',
                90
            )
        );

        if ($apiKey === '') {
            throw new RuntimeException(
                'OpenAI API key is not configured.'
            );
        }

        if ($model === '') {
            throw new RuntimeException(
                'OpenAI model is not configured.'
            );
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->connectTimeout(15)
            ->timeout($timeout)
            ->post(
                'https://api.openai.com/v1/responses',
                [
                    'model' => $model,

                    'instructions' =>
                        $this->systemInstructions(),

                    'input' =>
                        $this->prepareInput(
                            $snapshot
                        ),

                    'max_output_tokens' => 2500,

                    'text' => [
                        'format' => [
                            'type' => 'json_schema',

                            'name' =>
                                'restaurant_recommendations',

                            'strict' => true,

                            'schema' =>
                                $this->outputSchema(),
                        ],
                    ],
                ]
            );

        $this->ensureSuccessfulResponse(
            $response
        );

        $responseData = $response->json();

        if (!is_array($responseData)) {
            throw new RuntimeException(
                'OpenAI returned an invalid response.'
            );
        }

        if (
            isset($responseData['status']) &&
            $responseData['status']
                !== 'completed'
        ) {
            $reason = data_get(
                $responseData,
                'incomplete_details.reason',
                'unknown'
            );

            throw new RuntimeException(
                'OpenAI response was not completed. Reason: '
                . $reason
            );
        }

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
                $responseData['id']
                ?? null,

            'request_id' =>
                $response->header(
                    'x-request-id'
                ),

            'model' =>
                $responseData['model']
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
                            'usage.input_tokens'
                        )
                    ),

                'output_tokens' =>
                    $this->nullableInteger(
                        data_get(
                            $responseData,
                            'usage.output_tokens'
                        )
                    ),

                'total_tokens' =>
                    $this->nullableInteger(
                        data_get(
                            $responseData,
                            'usage.total_tokens'
                        )
                    ),
            ],
        ];
    }

    private function prepareInput(
        array $snapshot
    ): string {
        try {
            $json = json_encode(
                $snapshot,
                JSON_THROW_ON_ERROR
                | JSON_UNESCAPED_UNICODE
                | JSON_UNESCAPED_SLASHES
            );
        } catch (JsonException $exception) {
            throw new RuntimeException(
                'Unable to prepare restaurant analytics.',
                previous: $exception
            );
        }

        return implode(
            "\n",
            [
                'Analyse the following aggregated restaurant analytics.',
                'Use only facts contained in this JSON.',
                '',
                $json,
            ]
        );
    }

    private function systemInstructions(): string
    {
        return <<<'PROMPT'
You are a careful restaurant performance analyst.

Generate useful recommendations using only the supplied aggregated analytics.

Rules:
1. Never invent orders, revenue, percentages, products, customers, costs, margins, ingredients, stock levels, or operational facts.
2. Only mention a number when that number exists in the supplied data.
3. A 100% change from a zero previous-period baseline does not prove exceptional growth. Explain that the previous period had no paid orders.
4. If fewer than 20 paid orders are available, clearly use cautious language because the sample is limited.
5. Never claim profitability or product margins because cost data is not supplied.
6. Never claim ingredient shortages, overstock, waste, or inventory variance because inventory data is not supplied.
7. Marketing recommendations may only reference products and sales patterns found in the supplied analytics.
8. Each recommendation must contain a specific problem, practical solution, and realistic expected impact.
9. Expected impact must remain qualitative unless the supplied analytics directly supports a numeric statement.
10. Return between 3 and 5 non-duplicate recommendations.
11. Confidence must reflect the amount and quality of available data.
12. Use concise, professional English suitable for a restaurant owner.
PROMPT;
    }

    private function outputSchema(): array
    {
        return [
            'type' => 'object',

            'additionalProperties' =>
                false,

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
                        ],

                        'overview' => [
                            'type' => 'string',
                        ],

                        'focus_area' => [
                            'type' => 'string',
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
                            ],

                            'description' => [
                                'type' => 'string',
                            ],

                            'problem' => [
                                'type' => 'string',
                            ],

                            'solution' => [
                                'type' => 'string',
                            ],

                            'expected_impact' => [
                                'type' => 'string',
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function ensureSuccessfulResponse(
        Response $response
    ): void {
        if ($response->successful()) {
            return;
        }

        $message = $response->json(
            'error.message'
        );

        if (
            !is_string($message) ||
            trim($message) === ''
        ) {
            $message =
                'Unknown OpenAI API error.';
        }

        throw new RuntimeException(
            sprintf(
                'OpenAI request failed with HTTP %d: %s',
                $response->status(),
                $message
            )
        );
    }

    private function extractOutputText(
        array $response
    ): string {
        if (
            isset($response['output_text']) &&
            is_string(
                $response['output_text']
            ) &&
            trim(
                $response['output_text']
            ) !== ''
        ) {
            return $response[
                'output_text'
            ];
        }

        foreach (
            $response['output'] ?? []
            as $output
        ) {
            foreach (
                $output['content'] ?? []
                as $content
            ) {
                if (
                    ($content['type'] ?? null)
                        === 'refusal'
                ) {
                    $reason =
                        $content['refusal']
                        ?? 'Request refused.';

                    throw new RuntimeException(
                        'OpenAI refused the recommendation request: '
                        . $reason
                    );
                }

                if (
                    ($content['type'] ?? null)
                        === 'output_text' &&
                    isset($content['text']) &&
                    is_string(
                        $content['text']
                    ) &&
                    trim(
                        $content['text']
                    ) !== ''
                ) {
                    return $content['text'];
                }
            }
        }

        throw new RuntimeException(
            'OpenAI did not return recommendation content.'
        );
    }

    private function decodeOutput(
        string $output
    ): array {
        try {
            $decoded = json_decode(
                $output,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (JsonException $exception) {
            throw new RuntimeException(
                'OpenAI returned invalid recommendation JSON.',
                previous: $exception
            );
        }

        if (!is_array($decoded)) {
            throw new RuntimeException(
                'OpenAI recommendation output is not an object.'
            );
        }

        return $decoded;
    }

    private function validateOutput(
        array $output
    ): array {
        $validator = Validator::make(
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
                    'max:3000',
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
                'OpenAI returned recommendation data in an unexpected format.'
            );
        }

        return $validator->validated();
    }

    private function nullableInteger(
        mixed $value
    ): ?int {
        if (
            $value === null ||
            !is_numeric($value)
        ) {
            return null;
        }

        return (int) $value;
    }
}