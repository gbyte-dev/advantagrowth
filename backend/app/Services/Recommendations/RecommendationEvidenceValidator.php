<?php

namespace App\Services\Recommendations;

use Illuminate\Support\Arr;
use RuntimeException;

class RecommendationEvidenceValidator
{
    /**
     * Confirm that every evidence path and cited figure
     * comes from the original restaurant snapshot.
     */
    public function validate(
        array $recommendations,
        array $snapshot
    ): array {
        foreach (
            $recommendations
            as $recommendationIndex =>
                $recommendation
        ) {
            $evidenceItems =
                $recommendation[
                    'evidence'
                ]
                ?? [];

            if (
                !is_array(
                    $evidenceItems
                ) ||
                $evidenceItems === []
            ) {
                throw new RuntimeException(
                    "Recommendation {$recommendationIndex} has no evidence."
                );
            }

            $verifiedValues = [];
            $verifiedPaths = [];

            foreach (
                $evidenceItems
                as $evidenceIndex =>
                    $evidence
            ) {
                $path =
                    trim(
                        (string) (
                            $evidence[
                                'source_path'
                            ]
                            ?? ''
                        )
                    );

                $providedValue =
                    trim(
                        (string) (
                            $evidence[
                                'value'
                            ]
                            ?? ''
                        )
                    );

                if (
                    $path === '' ||
                    !Arr::has(
                        $snapshot,
                        $path
                    )
                ) {
                    throw new RuntimeException(
                        "Recommendation {$recommendationIndex} evidence {$evidenceIndex} references an unknown source path."
                    );
                }

                if (
                    in_array(
                        $path,
                        $verifiedPaths,
                        true
                    )
                ) {
                    throw new RuntimeException(
                        "Recommendation {$recommendationIndex} contains duplicate evidence path {$path}."
                    );
                }

                $actualValue =
                    data_get(
                        $snapshot,
                        $path
                    );

                if (
                    $actualValue ===
                        null ||
                    is_array(
                        $actualValue
                    ) ||
                    is_object(
                        $actualValue
                    )
                ) {
                    throw new RuntimeException(
                        "Recommendation {$recommendationIndex} evidence {$evidenceIndex} must reference a scalar snapshot value."
                    );
                }

                if (
                    !$this->valuesMatch(
                        $actualValue,
                        $providedValue
                    )
                ) {
                    throw new RuntimeException(
                        "Recommendation {$recommendationIndex} evidence {$evidenceIndex} does not match the snapshot value at {$path}."
                    );
                }

                $verifiedPaths[] =
                    $path;

                $verifiedValues[] =
                    $this->stringValue(
                        $actualValue
                    );
            }

            $this->validateCitedFigures(
                $recommendation,
                $verifiedValues,
                $snapshot,
                $recommendationIndex
            );
        }

        return $recommendations;
    }

    /**
     * Check values using exact scalar comparison.
     *
     * Numeric strings are normalized so values such as
     * 100, 100.0 and 100.00 are treated as equal.
     */
    private function valuesMatch(
        mixed $actualValue,
        string $providedValue
    ): bool {
        if (
            is_int($actualValue) ||
            is_float($actualValue)
        ) {
            if (
                !is_numeric(
                    str_replace(
                        ',',
                        '',
                        $providedValue
                    )
                )
            ) {
                return false;
            }

            return $this->normalizeNumber(
                (string) $actualValue
            ) ===
                $this->normalizeNumber(
                    $providedValue
                );
        }

        if (
            is_bool($actualValue)
        ) {
            return $providedValue ===
                (
                    $actualValue
                        ? 'true'
                        : 'false'
                );
        }

        return $providedValue ===
            (string) $actualValue;
    }

    /**
     * Make a verified scalar usable for claim matching.
     */
    private function stringValue(
        mixed $value
    ): string {
        if (is_bool($value)) {
            return $value
                ? 'true'
                : 'false';
        }

        return (string) $value;
    }

    /**
     * Confirm every date and number written in the
     * recommendation is represented by verified evidence.
     */
    private function validateCitedFigures(
        array $recommendation,
        array $verifiedValues,
        array $snapshot,
        int $recommendationIndex
    ): void {

            /*
         * Every scalar snapshot value is an allowed
         * source-backed claim. Evidence paths are still
         * independently verified above.
         */

        $snapshotValues =
            collect(
                Arr::dot(
                    $snapshot
                )
            )
                ->filter(
                    fn (
                        mixed $value
                    ): bool =>
                        $value !== null &&
                        !is_array(
                            $value
                        ) &&
                        !is_object(
                            $value
                        )
                )
                ->map(
                    fn (
                        mixed $value
                    ): string =>
                        $this->stringValue(
                            $value
                        )
                )
                ->values()
                ->all();

        $supportedValues =
            array_values(
                array_unique(
                    [
                        ...$verifiedValues,
                        ...$snapshotValues,
                    ]
                )
            );

        $text =
            implode(
                ' ',
                [
                    $recommendation[
                        'title'
                    ]
                    ?? '',

                    $recommendation[
                        'description'
                    ]
                    ?? '',

                    $recommendation[
                        'problem'
                    ]
                    ?? '',

                    $recommendation[
                        'solution'
                    ]
                    ?? '',

                    $recommendation[
                        'expected_impact'
                    ]
                    ?? '',
                ]
            );

        /*
         * Validate complete ISO dates before removing
         * them from numeric-token validation.
         */

        preg_match_all(
            '/\b\d{4}-\d{2}-\d{2}\b/',
            $text,
            $dateMatches
        );

        foreach (
            array_unique(
                $dateMatches[0]
                ?? []
            )
            as $date
        ) {
            if (
                !in_array(
                    $date,
                    $supportedValues,
                    true
                )
            ) {
                throw new RuntimeException(
                    "Recommendation {$recommendationIndex} cites unsupported date {$date}."
                );
            }
        }

        $textWithoutDates =
            preg_replace(
                '/\b\d{4}-\d{2}-\d{2}\b/',
                '',
                $text
            )
            ?? $text;

        /*
         * Capture integers, decimals, formatted currency
         * values and percentages.
         */

        preg_match_all(
            '/(?<![a-zA-Z0-9_])[-+]?\d[\d,]*(?:\.\d+)?%?/',
            $textWithoutDates,
            $numberMatches
        );

        $verifiedNumbers = [];

        foreach (
            $supportedValues
            as $verifiedValue
        ) {
            $candidate =
                str_replace(
                    [
                        ',',
                        '%',
                    ],
                    '',
                    trim(
                        $verifiedValue
                    )
                );

            if (
                is_numeric(
                    $candidate
                )
            ) {
                $verifiedNumbers[] =
                    $this->normalizeNumber(
                        $candidate
                    );
            }
        }

        foreach (
            array_unique(
                $numberMatches[0]
                ?? []
            )
            as $number
        ) {
            $normalizedNumber =
                $this->normalizeNumber(
                    $number
                );

            if (
                !in_array(
                    $normalizedNumber,
                    $verifiedNumbers,
                    true
                )
            ) {
                throw new RuntimeException(
                    "Recommendation {$recommendationIndex} cites unsupported numeric value {$number}."
                );
            }
        }
    }

    /**
     * Convert equivalent numeric formats to one value.
     */
    private function normalizeNumber(
        string $value
    ): string {
        $normalized =
            str_replace(
                [
                    ',',
                    '%',
                    '+',
                ],
                '',
                trim(
                    $value
                )
            );

        if (!is_numeric($normalized)) {
            return $normalized;
        }

        $number =
            (float) $normalized;

        if (
            floor($number) ===
            $number
        ) {
            return (string)
                (int) $number;
        }

        return rtrim(
            rtrim(
                number_format(
                    $number,
                    10,
                    '.',
                    ''
                ),
                '0'
            ),
            '.'
        );
    }
}