<?php

namespace Tests\Unit;

use App\Services\Recommendations\RecommendationEvidenceValidator;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class RecommendationEvidenceValidatorTest extends TestCase
{
    private function snapshot(): array
    {
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
                    7,

                'revenue' =>
                    2687.00,
            ],

            'top_products' => [
                [
                    'name' =>
                        'Cheeseburger',

                    'quantity' =>
                        6,
                ],
            ],
        ];
    }

    private function recommendation(): array
    {
        return [
            'title' =>
                'Improve order performance',

            'category' =>
                'Operations',

            'priority' =>
                'high',

            'confidence' =>
                85,

            'description' =>
                'The restaurant recorded 7 orders.',

            'problem' =>
                'Order volume can be improved.',

            'solution' =>
                'Review daily order operations.',

            'expected_impact' =>
                'More consistent order performance.',

            'evidence' => [
                [
                    'source_path' =>
                        'summary.orders',

                    'label' =>
                        'Paid orders',

                    'value' =>
                        '7',
                ],
            ],
        ];
    }

    public function test_valid_evidence_is_accepted(): void
    {
        $validator =
            new RecommendationEvidenceValidator();

        $recommendations = [
            $this->recommendation(),
        ];

        $result =
            $validator->validate(
                $recommendations,
                $this->snapshot()
            );

        $this->assertSame(
            $recommendations,
            $result
        );
    }

    public function test_unknown_snapshot_path_is_rejected(): void
    {
        $recommendation =
            $this->recommendation();

        $recommendation[
            'evidence'
        ][0][
            'source_path'
        ] =
            'summary.fake_orders';

        $validator =
            new RecommendationEvidenceValidator();

        $this->expectException(
            RuntimeException::class
        );

        $this->expectExceptionMessage(
            'references an unknown source path'
        );

        $validator->validate(
            [$recommendation],
            $this->snapshot()
        );
    }

    public function test_incorrect_snapshot_value_is_rejected(): void
    {
        $recommendation =
            $this->recommendation();

        $recommendation[
            'evidence'
        ][0][
            'value'
        ] =
            '99';

        $validator =
            new RecommendationEvidenceValidator();

        $this->expectException(
            RuntimeException::class
        );

        $this->expectExceptionMessage(
            'does not match the snapshot value'
        );

        $validator->validate(
            [$recommendation],
            $this->snapshot()
        );
    }

    public function test_unsupported_numeric_claim_is_rejected(): void
    {
        $recommendation =
            $this->recommendation();

        /*
         * Evidence correctly verifies 7 orders,
         * but the description invents 99 orders.
         */

        $recommendation[
            'description'
        ] =
            'The restaurant recorded 99 orders.';

        $validator =
            new RecommendationEvidenceValidator();

        $this->expectException(
            RuntimeException::class
        );

        $this->expectExceptionMessage(
            'cites unsupported numeric value 99'
        );

        $validator->validate(
            [$recommendation],
            $this->snapshot()
        );
    }
}