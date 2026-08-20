<?php

namespace App\Services\POS;

use App\Services\POS\Custom\CustomApiProvider;
use App\Services\POS\Restolution\RestolutionProvider;
use App\Services\POS\Toast\ToastProvider;
use InvalidArgumentException;

class PosManager
{
    /**
     * Resolve POS provider adapter.
     */
    public function driver(
        string $provider
    ): PosProviderInterface {
        $provider =
            strtolower(
                trim($provider)
            );

        return match ($provider) {
            'toast',
            'toast pos' =>
                $this->resolve(
                    ToastProvider::class
                ),

            'restolution' =>
                $this->resolve(
                    RestolutionProvider::class
                ),

            'custom',
            'custom api' =>
                $this->resolve(
                    CustomApiProvider::class
                ),

            default =>
                throw new InvalidArgumentException(
                    "Unsupported POS provider: {$provider}"
                ),
        };
    }

    /**
     * Resolve provider through
     * Laravel service container.
     */
    private function resolve(
        string $providerClass
    ): PosProviderInterface {
        if (
            !class_exists(
                $providerClass
            )
        ) {
            throw new InvalidArgumentException(
                'POS provider adapter is not configured yet.'
            );
        }

        $driver =
            app($providerClass);

        if (
            !$driver instanceof
                PosProviderInterface
        ) {
            throw new InvalidArgumentException(
                'Invalid POS provider adapter.'
            );
        }

        return $driver;
    }
}