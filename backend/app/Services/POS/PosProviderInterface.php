<?php

namespace App\Services\POS;

use App\Models\PosConnection;

interface PosProviderInterface
{
    /**
     * Test whether supplied POS credentials are valid.
     */
    public function testConnection(PosConnection $connection): array;

    /**
     * Fetch merchant/business information from POS.
     */
    public function getMerchant(PosConnection $connection): array;

    /**
     * Fetch restaurant/store locations from POS.
     */
    public function getLocations(PosConnection $connection): array;
}
