<?php

namespace App\Services\POS;

use App\Models\PosConnection;
use Carbon\CarbonInterface;

interface PosProviderInterface
{
    /**
     * Test whether supplied POS credentials are valid.
     */
    public function testConnection(
        PosConnection $connection
    ): array;

    /**
     * Fetch merchant/business information.
     */
    public function getMerchant(
        PosConnection $connection
    ): array;

    /**
     * Fetch restaurant/store locations.
     */
    public function getLocations(
        PosConnection $connection
    ): array;

    /**
     * Fetch normalized orders from POS.
     */
    public function getOrders(
        PosConnection $connection,
        CarbonInterface $start,
        CarbonInterface $end
    ): array;
}