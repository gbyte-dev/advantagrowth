<?php

namespace App\Services\POS\Toast;

use App\Models\PosConnection;
use App\Services\POS\PosProviderInterface;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;
use App\Services\POS\PosUrlValidator;

class ToastProvider implements PosProviderInterface
{
    /**
     * Test Toast credentials and API access.
     */
    public function testConnection(
        PosConnection $connection
    ): array {
        try {
            $token = $this->getAccessToken(
                $connection
            );

            $restaurants =
                $this->getAccessibleRestaurants(
                    $connection,
                    $token
                );

            if (empty($restaurants)) {
                throw new RuntimeException(
                    'Toast authentication succeeded, but no accessible restaurants were returned.'
                );
            }

            return [
                'success' => true,

                'message' =>
                    'Toast connection successful.',

                'restaurants_count' =>
                    count($restaurants),

                'restaurants' =>
                    array_map(
                        function (
                            array $restaurant
                        ) {
                            return [
                                'restaurant_guid' =>
                                    data_get(
                                        $restaurant,
                                        'restaurantGuid'
                                    ),

                                'restaurant_name' =>
                                    data_get(
                                        $restaurant,
                                        'restaurantName'
                                    ),

                                'location_name' =>
                                    data_get(
                                        $restaurant,
                                        'locationName'
                                    ),

                                'management_group_guid' =>
                                    data_get(
                                        $restaurant,
                                        'managementGroupGuid'
                                    ),
                            ];
                        },
                        $restaurants
                    ),
            ];
        } catch (Throwable $exception) {
            return [
                'success' => false,

                'message' =>
                    $exception->getMessage(),
            ];
        }
    }

    /**
     * Fetch selected Toast restaurant.
     */
    public function getMerchant(
        PosConnection $connection
    ): array {
        $token =
            $this->getAccessToken(
                $connection
            );

        $restaurants =
            $this->getAccessibleRestaurants(
                $connection,
                $token
            );

        if (empty($restaurants)) {
            throw new RuntimeException(
                'No Toast restaurants are accessible for this account.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Selected Toast Restaurant
        |--------------------------------------------------------------------------
        |
        | external_merchant_id stores the restaurantGuid selected
        | by the restaurant owner.
        |
        */

        $primary = null;

        if (
            $connection->external_merchant_id
        ) {
            foreach (
                $restaurants
                as $restaurant
            ) {
                $restaurantGuid =
                    data_get(
                        $restaurant,
                        'restaurantGuid'
                    );

                if (
                    $restaurantGuid ===
                    $connection
                        ->external_merchant_id
                ) {
                    $primary =
                        $restaurant;

                    break;
                }
            }

            /*
             * Do not silently switch to another
             * Toast restaurant.
             */

            if (!$primary) {
                throw new RuntimeException(
                    'The selected Toast restaurant is no longer accessible to this API account.'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Legacy fallback
        |--------------------------------------------------------------------------
        */

        if (!$primary) {
            $primary =
                $restaurants[0];
        }

        $restaurantGuid =
            data_get(
                $primary,
                'restaurantGuid'
            );

        if (!$restaurantGuid) {
            throw new RuntimeException(
                'Toast restaurant GUID was not returned.'
            );
        }

        $details =
            $this->getRestaurantDetails(
                $connection,
                $token,
                $restaurantGuid
            );

        return $this->normalizeMerchant(
            $primary,
            $details
        );
    }

    /**
     * Fetch all Toast restaurant locations
     * accessible to this client.
     */
    public function getLocations(
        PosConnection $connection
    ): array {
        $token =
            $this->getAccessToken(
                $connection
            );

        $restaurants =
            $this->getAccessibleRestaurants(
                $connection,
                $token
            );

        $locations = [];

        foreach (
            $restaurants
            as $restaurant
        ) {
            $restaurantGuid =
                data_get(
                    $restaurant,
                    'restaurantGuid'
                );

            if (!$restaurantGuid) {
                continue;
            }

            try {
                $details =
                    $this->getRestaurantDetails(
                        $connection,
                        $token,
                        $restaurantGuid
                    );

                $locations[] =
                    $this->normalizeLocation(
                        $restaurant,
                        $details
                    );
            } catch (
                Throwable $exception
            ) {
                /*
                 * Keep basic location information
                 * even if detailed lookup fails.
                 */

                $locations[] = [
                    'external_location_id' =>
                        $restaurantGuid,

                    'external_business_id' =>
                        data_get(
                            $restaurant,
                            'managementGroupGuid'
                        ),

                    'name' =>
                        data_get(
                            $restaurant,
                            'restaurantName'
                        ),

                    'legal_name' =>
                        null,

                    'phone' =>
                        null,

                    'email' =>
                        data_get(
                            $restaurant,
                            'createdByEmailAddress'
                        ),

                    'address_line_1' =>
                        data_get(
                            $restaurant,
                            'locationName'
                        ),

                    'address_line_2' =>
                        null,

                    'city' =>
                        null,

                    'postal_code' =>
                        null,

                    'country' =>
                        null,

                    'currency' =>
                        null,

                    'timezone' =>
                        null,

                    'raw_data' => [
                        'partner' =>
                            $restaurant,

                        'details_error' =>
                            $exception
                                ->getMessage(),
                    ],
                ];
            }
        }

        return $locations;
    }

    /**
     * Fetch normalized Toast orders.
     */
    public function getOrders(
        PosConnection $connection,
        CarbonInterface $start,
        CarbonInterface $end
    ): array {
        $restaurantGuid =
            $connection
                ->external_merchant_id;

        if (!$restaurantGuid) {
            throw new RuntimeException(
                'Toast restaurant GUID is required before syncing orders.'
            );
        }

        $token =
            $this->getAccessToken(
                $connection
            );

        $page = 1;
        $pageSize = 100;

        $normalizedOrders = [];

        while (true) {
            $response =
                Http::acceptJson()
                    ->withToken(
                        $token
                    )
                    ->withHeaders([
                        'Toast-Restaurant-External-ID' =>
                            $restaurantGuid,
                    ])
                    ->timeout(30)
                    ->connectTimeout(10)
                    ->get(
                        $this->baseUrl(
                            $connection
                        ) .
                        '/orders/v2/ordersBulk',
                        [
                            'startDate' =>
                                $start->format(
                                    'Y-m-d\TH:i:s.vO'
                                ),

                            'endDate' =>
                                $end->format(
                                    'Y-m-d\TH:i:s.vO'
                                ),

                            'page' =>
                                $page,

                            'pageSize' =>
                                $pageSize,
                        ]
                    );

            if (
                !$response->successful()
            ) {
                throw new RuntimeException(
                    'Unable to fetch Toast orders. HTTP ' .
                    $response->status()
                );
            }

            $orders =
                $response->json();

            if (!is_array($orders)) {
                throw new RuntimeException(
                    'Toast orders response is invalid.'
                );
            }

            foreach (
                $orders
                as $order
            ) {
                if (!is_array($order)) {
                    continue;
                }

                $normalizedOrders[] =
                    $this->normalizeOrder(
                        $connection,
                        $order
                    );
            }

            /*
             * Last page.
             */

            if (
                count($orders) <
                $pageSize
            ) {
                break;
            }

            $page++;

            /*
             * Safety guard against an unexpected
             * endless pagination response.
             */

            if ($page > 1000) {
                throw new RuntimeException(
                    'Toast orders pagination exceeded the safety limit.'
                );
            }
        }

        return $normalizedOrders;
    }

    /**
     * Authenticate with Toast.
     */
    private function getAccessToken(
        PosConnection $connection
    ): string {
        $clientId =
            $connection->api_key;

        $clientSecret =
            $connection
                ->access_token;

        if (
            !$clientId ||
            !$clientSecret
        ) {
            throw new RuntimeException(
                'Toast Client ID and Client Secret are required.'
            );
        }

        $baseUrl =
            $this->baseUrl(
                $connection
            );

        $response =
            Http::acceptJson()
                ->asJson()
                ->timeout(20)
                ->connectTimeout(10)
                ->post(
                    $baseUrl .
                    '/authentication/v1/authentication/login',
                    [
                        'clientId' =>
                            $clientId,

                        'clientSecret' =>
                            $clientSecret,

                        'userAccessType' =>
                            'TOAST_MACHINE_CLIENT',
                    ]
                );

        if (
            !$response->successful()
        ) {
            throw new RuntimeException(
                'Toast authentication failed. HTTP ' .
                $response->status()
            );
        }

        $data =
            $response->json();

        $token =
            data_get(
                $data,
                'token.accessToken'
            );

        if (!$token) {
            throw new RuntimeException(
                'Toast authentication token was not returned.'
            );
        }

        return (string) $token;
    }

    /**
     * Get restaurants accessible by this
     * Toast partner client.
     */
    private function getAccessibleRestaurants(
        PosConnection $connection,
        string $token
    ): array {
        $response =
            Http::acceptJson()
                ->withToken(
                    $token
                )
                ->timeout(20)
                ->connectTimeout(10)
                ->get(
                    $this->baseUrl(
                        $connection
                    ) .
                    '/partners/v1/restaurants'
                );

        if (
            !$response->successful()
        ) {
            throw new RuntimeException(
                'Unable to fetch Toast restaurants. HTTP ' .
                $response->status()
            );
        }

        $data =
            $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'Toast restaurants response is invalid.'
            );
        }

        return array_values(
            array_filter(
                $data,
                fn ($item) =>
                    is_array($item) &&
                    !data_get(
                        $item,
                        'deleted',
                        false
                    )
            )
        );
    }

    /**
     * Get detailed configuration for one
     * Toast restaurant.
     */
    private function getRestaurantDetails(
        PosConnection $connection,
        string $token,
        string $restaurantGuid
    ): array {
        $response =
            Http::acceptJson()
                ->withToken(
                    $token
                )
                ->withHeaders([
                    'Toast-Restaurant-External-ID' =>
                        $restaurantGuid,
                ])
                ->timeout(20)
                ->connectTimeout(10)
                ->get(
                    $this->baseUrl(
                        $connection
                    ) .
                    '/restaurants/v1/restaurants/' .
                    $restaurantGuid,
                    [
                        'includeArchived' =>
                            'true',
                    ]
                );

        if (
            !$response->successful()
        ) {
            throw new RuntimeException(
                'Unable to fetch Toast restaurant details. HTTP ' .
                $response->status()
            );
        }

        $data =
            $response->json();

        if (!is_array($data)) {
            throw new RuntimeException(
                'Toast restaurant detail response is invalid.'
            );
        }

        return $data;
    }

    /**
     * Normalize merchant.
     */
    private function normalizeMerchant(
        array $partner,
        array $details
    ): array {
        return [
            'external_merchant_id' =>
                data_get(
                    $partner,
                    'restaurantGuid'
                ) ??
                data_get(
                    $details,
                    'guid'
                ),

            'name' =>
                data_get(
                    $details,
                    'general.name'
                ) ??
                data_get(
                    $partner,
                    'restaurantName'
                ),

            'legal_name' =>
                null,

            'phone' =>
                data_get(
                    $details,
                    'general.phone'
                ),

            'email' =>
                data_get(
                    $partner,
                    'createdByEmailAddress'
                ),

            'address_line_1' =>
                data_get(
                    $partner,
                    'locationName'
                ),

            'address_line_2' =>
                null,

            'city' =>
                null,

            'postal_code' =>
                null,

            'country' =>
                null,

            'currency' =>
                null,

            'timezone' =>
                data_get(
                    $details,
                    'general.timeZone'
                ),

            'raw_data' => [
                'partner' =>
                    $partner,

                'details' =>
                    $details,
            ],
        ];
    }

    /**
     * Normalize location.
     */
    private function normalizeLocation(
        array $partner,
        array $details
    ): array {
        return [
            'external_location_id' =>
                data_get(
                    $partner,
                    'restaurantGuid'
                ) ??
                data_get(
                    $details,
                    'guid'
                ),

            'external_business_id' =>
                data_get(
                    $partner,
                    'managementGroupGuid'
                ) ??
                data_get(
                    $details,
                    'general.managementGroupGuid'
                ),

            'name' =>
                data_get(
                    $details,
                    'general.name'
                ) ??
                data_get(
                    $partner,
                    'restaurantName'
                ),

            'legal_name' =>
                null,

            'phone' =>
                data_get(
                    $details,
                    'general.phone'
                ),

            'email' =>
                data_get(
                    $partner,
                    'createdByEmailAddress'
                ),

            'address_line_1' =>
                data_get(
                    $partner,
                    'locationName'
                ),

            'address_line_2' =>
                null,

            'city' =>
                null,

            'postal_code' =>
                null,

            'country' =>
                null,

            'currency' =>
                null,

            'timezone' =>
                data_get(
                    $details,
                    'general.timeZone'
                ),

            'raw_data' => [
                'partner' =>
                    $partner,

                'details' =>
                    $details,
            ],
        ];
    }

    /**
     * Normalize one Toast order into
     * Advanta internal order structure.
     */
    private function normalizeOrder(
        PosConnection $connection,
        array $order
    ): array {
        $checks =
            data_get(
                $order,
                'checks',
                []
            );

        if (!is_array($checks)) {
            $checks = [];
        }

        $subtotal = 0.0;
        $taxAmount = 0.0;
        $total = 0.0;
        $tipAmount = 0.0;

        $items = [];
        $payments = [];

        $customerName = null;
        $customerPhone = null;
        $customerEmail = null;

        $paymentStatus =
            'pending';

        $paymentMethod =
            null;

        /*
        |--------------------------------------------------------------------------
        | Process checks
        |--------------------------------------------------------------------------
        */

        foreach (
            $checks
            as $check
        ) {
            if (!is_array($check)) {
                continue;
            }

            $subtotal +=
                (float)
                    data_get(
                        $check,
                        'amount',
                        0
                    );

            $taxAmount +=
                (float)
                    data_get(
                        $check,
                        'taxAmount',
                        0
                    );

            $total +=
                (float)
                    data_get(
                        $check,
                        'totalAmount',
                        0
                    );

            /*
            |--------------------------------------------------------------------------
            | Customer
            |--------------------------------------------------------------------------
            */

            $customer =
                data_get(
                    $check,
                    'customer'
                );

            if (
                is_array(
                    $customer
                )
            ) {
                $name =
                    trim(
                        implode(
                            ' ',
                            array_filter([
                                data_get(
                                    $customer,
                                    'firstName'
                                ),

                                data_get(
                                    $customer,
                                    'lastName'
                                ),
                            ])
                        )
                    );

                if (
                    !$customerName &&
                    $name !== ''
                ) {
                    $customerName =
                        $name;
                }

                $customerPhone =
                    $customerPhone ??
                    data_get(
                        $customer,
                        'phone'
                    );

                $customerEmail =
                    $customerEmail ??
                    data_get(
                        $customer,
                        'email'
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Payment status
            |--------------------------------------------------------------------------
            */

            $toastPaymentStatus =
                strtoupper(
                    (string)
                        data_get(
                            $check,
                            'paymentStatus',
                            ''
                        )
                );

            if (
                in_array(
                    $toastPaymentStatus,
                    [
                        'PAID',
                        'CLOSED',
                    ],
                    true
                )
            ) {
                $paymentStatus =
                    'paid';
            }

            /*
            |--------------------------------------------------------------------------
            | Payments
            |--------------------------------------------------------------------------
            */

            $checkPayments =
                data_get(
                    $check,
                    'payments',
                    []
                );

            if (
                is_array(
                    $checkPayments
                )
            ) {
                foreach (
                    $checkPayments
                    as $payment
                ) {
                    if (
                        !is_array(
                            $payment
                        )
                    ) {
                        continue;
                    }

                    $tip =
                        (float)
                            data_get(
                                $payment,
                                'tipAmount',
                                0
                            );

                    $tipAmount +=
                        $tip;

                    $type =
                        data_get(
                            $payment,
                            'type'
                        );

                    if (
                        !$paymentMethod &&
                        $type
                    ) {
                        $paymentMethod =
                            strtolower(
                                (string)
                                    $type
                            );
                    }

                    $payments[] = [
                        'external_payment_id' =>
                            data_get(
                                $payment,
                                'guid'
                            ) ??
                            data_get(
                                $payment,
                                'externalId'
                            ),

                        'type' =>
                            $type,

                        'amount' =>
                            (float)
                                data_get(
                                    $payment,
                                    'amount',
                                    0
                                ),

                        'tip_amount' =>
                            $tip,

                        'paid_at' =>
                            data_get(
                                $payment,
                                'paidDate'
                            ),

                        'card_type' =>
                            data_get(
                                $payment,
                                'cardType'
                            ),

                        'raw_data' =>
                            $payment,
                    ];
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Order Items
            |--------------------------------------------------------------------------
            */

            $selections =
                data_get(
                    $check,
                    'selections',
                    []
                );

            if (
                !is_array(
                    $selections
                )
            ) {
                continue;
            }

            foreach (
                $selections
                as $selection
            ) {
                if (
                    !is_array(
                        $selection
                    )
                ) {
                    continue;
                }

                if (
                    data_get(
                        $selection,
                        'voided',
                        false
                    )
                ) {
                    continue;
                }

                $quantity =
                    (float)
                        data_get(
                            $selection,
                            'quantity',
                            1
                        );

                if ($quantity <= 0) {
                    $quantity = 1;
                }

                $lineTotal =
    (float)
        data_get(
            $selection,
            'price',
            0
        );

$unitPrice =
    (float)
        (
            data_get(
                $selection,
                'receiptLinePrice'
            )
            ??
            (
                $quantity > 0
                    ? $lineTotal / $quantity
                    : $lineTotal
            )
        );

                $items[] = [
                    'external_item_id' =>
                        data_get(
                            $selection,
                            'guid'
                        ) ??
                        data_get(
                            $selection,
                            'externalId'
                        ),

                    'external_menu_item_id' =>
                        data_get(
                            $selection,
                            'item.guid'
                        ) ??
                        data_get(
                            $selection,
                            'item.externalId'
                        ),

                    'item_name' =>
                        data_get(
                            $selection,
                            'displayName'
                        ) ??
                        'Toast Item',

                    'quantity' =>
                        $quantity,

                    'unit_price' =>
                        round(
                            $unitPrice,
                            2
                        ),

                    'total_price' =>
                        round(
                            $lineTotal,
                            2
                        ),

                    'modifiers' =>
                        $this->normalizeModifiers(
                            data_get(
                                $selection,
                                'modifiers',
                                []
                            )
                        ),

                    'raw_data' =>
                        $selection,
                ];
            }
        }

        $status =
            $this->normalizeOrderStatus(
                $order,
                $checks
            );

        return [
            'external_order_id' =>
                data_get(
                    $order,
                    'guid'
                ) ??
                data_get(
                    $order,
                    'externalId'
                ),

            'external_location_id' =>
                $connection
                    ->external_merchant_id,

            'source' =>
                'toast',

            'order_type' =>
                data_get(
                    $order,
                    'diningOption.name'
                ) ??
                data_get(
                    $order,
                    'diningOption.externalId'
                ) ??
                data_get(
                    $order,
                    'diningOption.guid'
                ),

            'table_number' =>
                data_get(
                    $order,
                    'table.name'
                ) ??
                data_get(
                    $order,
                    'table.externalId'
                ) ??
                data_get(
                    $order,
                    'table.guid'
                ),

            'customer_name' =>
                $customerName ?:
                'POS Customer',

            /*
             * Current orders schema requires
             * customer_phone NOT NULL.
             */

            'customer_phone' =>
                $customerPhone ?:
                'N/A',

            'customer_email' =>
                $customerEmail,

            'delivery_address' =>
                null,

            'subtotal' =>
                round(
                    $subtotal,
                    2
                ),

            'tax_amount' =>
                round(
                    $taxAmount,
                    2
                ),

            'delivery_charge' =>
                0,

            'tip_amount' =>
                round(
                    $tipAmount,
                    2
                ),

            'total' =>
                round(
                    $total,
                    2
                ),

            'status' =>
                $status,

            'payment_status' =>
                $paymentStatus,

            'payment_method' =>
                $paymentMethod,

            'payment_id' =>
                $payments[0][
                    'external_payment_id'
                ] ?? null,

            'special_instructions' =>
                null,

            'pos_created_at' =>
                data_get(
                    $order,
                    'openedDate'
                ) ??
                data_get(
                    $order,
                    'createdDate'
                ),

            'pos_updated_at' =>
                data_get(
                    $order,
                    'modifiedDate'
                ),

            'items' =>
                $items,

            'payments' =>
                $payments,

            'raw_data' =>
                $order,
        ];
    }

    /**
     * Normalize Toast modifiers.
     */
    private function normalizeModifiers(
        mixed $modifiers
    ): array {
        if (!is_array($modifiers)) {
            return [];
        }

        $result = [];

        foreach (
            $modifiers
            as $modifier
        ) {
            if (
                !is_array(
                    $modifier
                )
            ) {
                continue;
            }

            $result[] = [
                'external_item_id' =>
                    data_get(
                        $modifier,
                        'guid'
                    ) ??
                    data_get(
                        $modifier,
                        'externalId'
                    ),

                'external_menu_item_id' =>
                    data_get(
                        $modifier,
                        'item.guid'
                    ) ??
                    data_get(
                        $modifier,
                        'item.externalId'
                    ),

                'name' =>
                    data_get(
                        $modifier,
                        'displayName'
                    ) ??
                    'Modifier',

                'quantity' =>
                    (float)
                        data_get(
                            $modifier,
                            'quantity',
                            1
                        ),

                'price' =>
                    (float)
                        data_get(
                            $modifier,
                            'price',
                            0
                        ),

                'raw_data' =>
                    $modifier,
            ];
        }

        return $result;
    }

    /**
     * Normalize Toast order status.
     */
    private function normalizeOrderStatus(
        array $order,
        array $checks
    ): string {
        if (
            data_get(
                $order,
                'voided',
                false
            )
        ) {
            return 'cancelled';
        }

        $approvalStatus =
            strtoupper(
                (string)
                    data_get(
                        $order,
                        'approvalStatus',
                        ''
                    )
            );

        if (
            $approvalStatus ===
            'NEEDS_APPROVAL'
        ) {
            return 'pending';
        }

        $hasOpenCheck = false;

        foreach (
            $checks
            as $check
        ) {
            if (
                !is_array(
                    $check
                )
            ) {
                continue;
            }

            $paymentStatus =
                strtoupper(
                    (string)
                        data_get(
                            $check,
                            'paymentStatus',
                            ''
                        )
                );

            if (
                $paymentStatus ===
                'OPEN'
            ) {
                $hasOpenCheck = true;

                break;
            }
        }

        if ($hasOpenCheck) {
            return 'preparing';
        }

        return 'completed';
    }

    /**
     * Normalize and validate Toast base URL.
     */
   private function baseUrl(
    PosConnection $connection
): string {
    return PosUrlValidator::validate(
        (string) $connection->base_url
    );
}
}