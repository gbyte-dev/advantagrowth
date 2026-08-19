<?php

namespace App\Services\POS;

use InvalidArgumentException;

class PosManager
{
    /**
     * Resolve POS provider adapter.
     */
    public function driver(string $provider): PosProviderInterface
    {
        $provider = strtolower(trim($provider));

        return match ($provider) {
            'square',
            'square pos' => $this->resolve(
                \App\Services\POS\Square\SquareProvider::class
            ),

            'toast',
            'toast pos' => $this->resolve(
                \App\Services\POS\Toast\ToastProvider::class
            ),

            'clover',
            'clover pos' => $this->resolve(
                \App\Services\POS\Clover\CloverProvider::class
            ),

            'lightspeed' => $this->resolve(
                \App\Services\POS\Lightspeed\LightspeedProvider::class
            ),

            'restolution' => $this->resolve(
                \App\Services\POS\Restolution\RestolutionProvider::class
            ),

            'custom',
            'custom api' => $this->resolve(
                \App\Services\POS\Custom\CustomApiProvider::class
            ),

            default => throw new InvalidArgumentException(
                "Unsupported POS provider: {$provider}"
            ),
        };
    }

    /**
     * Resolve provider through Laravel service container.
     */
    private function resolve(
        string $providerClass
    ): PosProviderInterface {
        if (!class_exists($providerClass)) {
            throw new InvalidArgumentException(
                'POS provider adapter is not configured yet.'
            );
        }

        $driver = app($providerClass);

        if (!$driver instanceof PosProviderInterface) {
            throw new InvalidArgumentException(
                'Invalid POS provider adapter.'
            );
        }

        return $driver;
    }
}
