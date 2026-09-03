<?php

namespace App\Services\Recommendations;

use RuntimeException;

class RecommendationAiManager
{
    public function __construct(
        private readonly OpenAiRecommendationService $openAiService,
        private readonly GeminiRecommendationService $geminiService
    ) {
    }

    /**
     * Generate recommendations using the selected provider.
     */
    public function generate(
        array $snapshot
    ): array {
        return match (
            $this->provider()
        ) {
            'openai' =>
                $this->openAiService
                    ->generate(
                        $snapshot
                    ),

            'gemini' =>
                $this->geminiService
                    ->generate(
                        $snapshot
                    ),
        };
    }

    /**
     * Return the selected provider name.
     */
    public function provider(): string
    {
        $provider =
            strtolower(
                trim(
                    (string) config(
                        'services.recommendation_ai.provider',
                        'openai'
                    )
                )
            );

        if (
            !in_array(
                $provider,
                [
                    'openai',
                    'gemini',
                ],
                true
            )
        ) {
            throw new RuntimeException(
                sprintf(
                    'Unsupported recommendation AI provider: %s',
                    $provider !== ''
                        ? $provider
                        : 'empty'
                )
            );
        }

        return $provider;
    }

    /**
     * Return the configured model for the selected provider.
     */
    public function model(): string
    {
        $provider =
            $this->provider();

        $model =
            trim(
                (string) config(
                    "services.{$provider}.model"
                )
            );

        if ($model === '') {
            throw new RuntimeException(
                sprintf(
                    'Model is not configured for recommendation AI provider: %s',
                    $provider
                )
            );
        }

        return $model;
    }
}