<?php

namespace App\Services\POS;

use RuntimeException;

final class PosUrlValidator
{
    public static function validate(string $url): string
    {
        $url = trim($url);

        if ($url === '') {
            throw new RuntimeException(
                'POS API Base URL is required.'
            );
        }

        if (
            filter_var(
                $url,
                FILTER_VALIDATE_URL
            ) === false
        ) {
            throw new RuntimeException(
                'POS API Base URL is invalid.'
            );
        }

        $parts = parse_url($url);

        if (!is_array($parts)) {
            throw new RuntimeException(
                'POS API Base URL is invalid.'
            );
        }

        $scheme = strtolower(
            (string) ($parts['scheme'] ?? '')
        );

        $host = strtolower(
            (string) ($parts['host'] ?? '')
        );

        if ($host === '') {
            throw new RuntimeException(
                'POS API Base URL host is required.'
            );
        }

        if (
            !in_array(
                $scheme,
                ['http', 'https'],
                true
            )
        ) {
            throw new RuntimeException(
                'POS API Base URL must use HTTP or HTTPS.'
            );
        }

        if (
            isset($parts['user']) ||
            isset($parts['pass'])
        ) {
            throw new RuntimeException(
                'POS API Base URL must not contain embedded credentials.'
            );
        }

        if (isset($parts['fragment'])) {
            throw new RuntimeException(
                'POS API Base URL must not contain a URL fragment.'
            );
        }

        $isLocalEnvironment =
            app()->environment([
                'local',
                'testing',
            ]);

        $isLoopbackHost =
            in_array(
                $host,
                [
                    'localhost',
                    '127.0.0.1',
                    '::1',
                ],
                true
            );

        /*
         * Development/testing mock POS is allowed.
         */
        if (
            $isLocalEnvironment &&
            $isLoopbackHost
        ) {
            return rtrim(
                $url,
                '/'
            );
        }

        /*
         * Outside local/testing, only HTTPS.
         */
        if ($scheme !== 'https') {
            throw new RuntimeException(
                'POS API Base URL must use HTTPS.'
            );
        }

        /*
         * Direct IP supplied.
         */
        if (
            filter_var(
                $host,
                FILTER_VALIDATE_IP
            ) !== false
        ) {
            self::assertPublicIp(
                $host
            );

            return rtrim(
                $url,
                '/'
            );
        }

        if (
            $host === 'localhost' ||
            str_ends_with(
                $host,
                '.localhost'
            )
        ) {
            throw new RuntimeException(
                'POS API Base URL cannot point to localhost.'
            );
        }

        /*
         * Resolve domain and reject domains resolving
         * to internal/private/reserved addresses.
         */
        $records = @dns_get_record(
            $host,
            DNS_A | DNS_AAAA
        );

        if (
            !is_array($records) ||
            count($records) === 0
        ) {
            throw new RuntimeException(
                'POS API hostname could not be resolved.'
            );
        }

        $resolvedIps = [];

        foreach ($records as $record) {
            if (
                isset($record['ip']) &&
                is_string($record['ip'])
            ) {
                $resolvedIps[] =
                    $record['ip'];
            }

            if (
                isset($record['ipv6']) &&
                is_string($record['ipv6'])
            ) {
                $resolvedIps[] =
                    $record['ipv6'];
            }
        }

        $resolvedIps =
            array_values(
                array_unique(
                    $resolvedIps
                )
            );

        if (
            count($resolvedIps) === 0
        ) {
            throw new RuntimeException(
                'POS API hostname did not resolve to a valid IP address.'
            );
        }

        foreach (
            $resolvedIps
            as $resolvedIp
        ) {
            self::assertPublicIp(
                $resolvedIp
            );
        }

        return rtrim(
            $url,
            '/'
        );
    }

    private static function assertPublicIp(
        string $ip
    ): void {
        $isPublic =
            filter_var(
                $ip,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE |
                FILTER_FLAG_NO_RES_RANGE
            );

        if ($isPublic === false) {
            throw new RuntimeException(
                'POS API Base URL cannot point to a private, local or reserved network address.'
            );
        }
    }
}
