<?php

namespace App\Services\POS\Restolution;

use App\Models\PosConnection;
use App\Services\POS\PosProviderInterface;
use App\Services\POS\PosUrlValidator;
use Carbon\CarbonInterface;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class RestolutionProvider implements PosProviderInterface
{
    /*
    |--------------------------------------------------------------------------
    | TEST CONNECTION
    |--------------------------------------------------------------------------
    */

    public function testConnection(
        PosConnection $connection
    ): array {
        try {
            $this->validateConnection(
                $connection
            );

            $data = $this->call(
                $connection,
                'listRestaurants',
                [
                    'includeArticles' => false,
                    'includeBaseData' => true,
                    'includeCashRegisters' => true,
                ]
            );

            $restaurants =
                data_get(
                    $data,
                    'restaurants',
                    []
                );

            return [
                'success' => true,

                'message' =>
                    'Restolution connection successful.',

                'restaurants_count' =>
                    is_array($restaurants)
                        ? count($restaurants)
                        : 0,

                'restaurants' =>
                    is_array($restaurants)
                        ? array_values(
                            array_map(
                                fn (array $restaurant) => [
                                    'restaurant_guid' =>
                                        $restaurant[
                                            'businessUnitUUID'
                                        ]
                                        ??
                                        $restaurant[
                                            'restaurantID'
                                        ]
                                        ??
                                        null,

                                    'restaurant_name' =>
                                        $restaurant[
                                            'name'
                                        ]
                                        ??
                                        'Restolution Restaurant',

                                    'location_name' =>
                                        $restaurant[
                                            'name'
                                        ]
                                        ??
                                        null,
                                ],
                                array_filter(
                                    $restaurants,
                                    'is_array'
                                )
                            )
                        )
                        : [],
            ];
        } catch (ConnectionException $exception) {
            return [
                'success' => false,

                'message' =>
                    'Unable to reach Restolution API.',

                'error' =>
                    $exception->getMessage(),
            ];
        } catch (Throwable $exception) {
            return [
                'success' => false,

                'message' =>
                    $exception->getMessage(),
            ];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | MERCHANT
    |--------------------------------------------------------------------------
    */

    public function getMerchant(
        PosConnection $connection
    ): array {
        $restaurants =
            $this->restaurants(
                $connection,
                false
            );
    
        if (empty($restaurants)) {
            throw new RuntimeException(
                'No Restolution restaurant was found for these credentials.'
            );
        }

        $restaurant =
            $this->selectedRestaurant(
                $connection,
                $restaurants
            );

        $contact =
            is_array(
                $restaurant['contact']
                ?? null
            )
                ? $restaurant['contact']
                : [];

        return [
            'external_merchant_id' =>
                $restaurant[
                    'businessUnitUUID'
                ]
                ??
                $restaurant[
                    'restaurantID'
                ]
                ??
                null,

            'name' =>
                $restaurant['name']
                ??
                'Restolution Restaurant',

            'legal_name' =>
                $contact['companyName']
                ?? null,

            'phone' =>
                $contact['phoneNr']
                ??
                $contact['mobilePhoneNr']
                ??
                null,

            'email' =>
                $contact['emailAddress']
                ?? null,

            'address_line_1' =>
                $contact['street']
                ?? null,

            'address_line_2' =>
                null,

            'city' =>
                $contact['city']
                ?? null,

            'postal_code' =>
                $contact['postIndex']
                ?? null,

            'country' =>
                null,

            'currency' =>
                null,

            'timezone' =>
                null,

            'raw_data' =>
                $restaurant,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | LOCATIONS
    |--------------------------------------------------------------------------
    */

    public function getLocations(
        PosConnection $connection
    ): array {
        $restaurants =
            $this->restaurants(
                $connection,
                false
            );


        if (
            $connection
                ->external_merchant_id
        ) {
            $restaurants = [
                $this->selectedRestaurant(
                    $connection,
                    $restaurants
                ),
            ];
        }

        return collect(
            $restaurants
        )
            ->filter(
                fn ($restaurant) =>
                    is_array($restaurant)
            )
            ->map(
                function (
                    array $restaurant
                ) {
                    $contact =
                        is_array(
                            $restaurant[
                                'contact'
                            ] ?? null
                        )
                            ? $restaurant[
                                'contact'
                            ]
                            : [];

                    return [
                        'external_location_id' =>
                            $restaurant[
                                'businessUnitUUID'
                            ]
                            ??
                            $restaurant[
                                'restaurantID'
                            ]
                            ??
                            null,

                        'external_business_id' =>
                            $restaurant[
                                'clientUUID'
                            ]
                            ??
                            null,

                        'name' =>
                            $restaurant[
                                'name'
                            ]
                            ??
                            null,

                        'legal_name' =>
                            $contact[
                                'companyName'
                            ]
                            ??
                            null,

                        'phone' =>
                            $contact[
                                'phoneNr'
                            ]
                            ??
                            $contact[
                                'mobilePhoneNr'
                            ]
                            ??
                            null,

                        'email' =>
                            $contact[
                                'emailAddress'
                            ]
                            ??
                            null,

                        'address_line_1' =>
                            $contact[
                                'street'
                            ]
                            ??
                            null,

                        'address_line_2' =>
                            null,

                        'city' =>
                            $contact[
                                'city'
                            ]
                            ??
                            null,

                        'postal_code' =>
                            $contact[
                                'postIndex'
                            ]
                            ??
                            null,

                        'country' =>
                            null,

                        'currency' =>
                            null,

                        'timezone' =>
                            null,

                        'raw_data' =>
                            $restaurant,
                    ];
                }
            )
            ->values()
            ->all();
    }

    /*
    |--------------------------------------------------------------------------
    | MENU
    |--------------------------------------------------------------------------
    */

    public function getMenu(
        PosConnection $connection
    ): array {
        $restaurants =
            $this->restaurants(
                $connection,
                true
            );

        $categories = [];

        foreach (
            $restaurants
            as $restaurant
        ) {
            if (!is_array($restaurant)) {
                continue;
            }

            $businessUnitId =
                $restaurant[
                    'businessUnitUUID'
                ]
                ??
                $restaurant[
                    'restaurantID'
                ]
                ??
                'restolution';

            $menus =
                $restaurant[
                    'menus'
                ]
                ?? [];

            if (!is_array($menus)) {
                continue;
            }

            foreach (
                $menus
                as $menuIndex => $menu
            ) {
                if (!is_array($menu)) {
                    continue;
                }

                $menuId =
                    $menu[
                        'menuID'
                    ]
                    ??
                    (string) $menuIndex;

                $items = [];

                $articles =
                    $menu[
                        'articles'
                    ]
                    ?? [];

                if (!is_array($articles)) {
                    $articles = [];
                }

                foreach (
                    $articles
                    as $article
                ) {
                    if (!is_array($article)) {
                        continue;
                    }

                    if (
                        strtoupper(
                            (string) (
                                $article[
                                    'type'
                                ]
                                ?? 'SALE'
                            )
                        )
                        === 'OPTION'
                    ) {
                        continue;
                    }

                    $articleId =
                        $article[
                            'articleID'
                        ]
                        ?? null;

                    if (!$articleId) {
                        continue;
                    }

                    $items[] = [
                        'external_item_id' =>
                            $businessUnitId
                            . ':'
                            . $articleId,

                        'name' =>
                            $article[
                                'name'
                            ]
                            ??
                            'Restolution Item',

                        'description' =>
                            $article[
                                'description'
                            ]
                            ??
                            null,

                        'price' =>
                            $this->articlePrice(
                                $article
                            ),

                        'image' =>
                            null,

                        'food_type' =>
                            'veg',

                        'is_available' =>
                            true,

                        'is_active' =>
                            true,

                        'sort_order' =>
                            count(
                                $items
                            ),
                    ];
                }

                $categories[] = [
                    'external_category_id' =>
                        $businessUnitId
                        . ':'
                        . $menuId,

                    'name' =>
                        $menu[
                            'name'
                        ]
                        ??
                        'Restolution Menu',

                    'description' =>
                        null,

                    'is_active' =>
                        true,

                    'sort_order' =>
                        $menuIndex,

                    'items' =>
                        $items,
                ];
            }
        }

        return $categories;
    }

    /*
    |--------------------------------------------------------------------------
    | SALES / ORDERS
    |--------------------------------------------------------------------------
    |
    | Advanta expects restaurant sales data here.
    | Restolution completed sales are exposed through getReceipts.
    |
    */

    public function getOrders(
        PosConnection $connection,
        CarbonInterface $start,
        CarbonInterface $end
    ): array {
        $orders = [];

        /*
        |--------------------------------------------------------------------------
        | Restolution getReceipts maximum period is 7 days.
        |--------------------------------------------------------------------------
        */

        $cursor =
            $start->copy();

        while (
            $cursor->lessThanOrEqualTo(
                $end
            )
        ) {
            $chunkEnd =
                $cursor
                    ->copy()
                    ->addDays(6)
                    ->endOfDay();

            if (
                $chunkEnd->greaterThan(
                    $end
                )
            ) {
                $chunkEnd =
                    $end->copy();
            }

            $params = [
                'receiptTimeFromDate' =>
                    $cursor
                        ->toIso8601String(),

                'receiptTimeUntilDate' =>
                    $chunkEnd
                        ->toIso8601String(),

                'includeSaleRows' =>
                    true,

                'includePaymentRows' =>
                    true,

                'includeRowComments' =>
                    true,

                'includePaymentTerminalTransactionData' =>
                    true,

                'includeAdditionalJson' =>
                    true,
            ];

            if (
                $connection
                    ->external_merchant_id
            ) {
                $params[
                    'businessUnitUUIDs'
                ] = [
                    $connection
                        ->external_merchant_id,
                ];
            }

            $data =
                $this->call(
                    $connection,
                    'getReceipts',
                    $params
                );

            $receipts =
                data_get(
                    $data,
                    'receipts',
                    []
                );

            if (
                is_array(
                    $receipts
                )
            ) {
                foreach (
                    $receipts
                    as $receipt
                ) {
                    if (
                        !is_array(
                            $receipt
                        )
                    ) {
                        continue;
                    }

                    $normalized =
                        $this
                            ->normalizeReceipt(
                                $receipt
                            );

                    if ($normalized) {
                        $orders[] =
                            $normalized;
                    }
                }
            }

            $cursor =
                $chunkEnd
                    ->copy()
                    ->addSecond();
        }

        return $orders;
    }

    /*
    |--------------------------------------------------------------------------
    | RESTOLUTION REQUEST
    |--------------------------------------------------------------------------
    */

    private function call(
        PosConnection $connection,
        string $method,
        array $params = []
    ): array {
        $this->validateConnection(
            $connection
        );

        $payload = [
            'timestamp' =>
                now()
                    ->utc()
                    ->format(
                        'Y-m-d\TH:i:s.v\Z'
                    ),

            'requestID' =>
                'advanta_'
                . Str::uuid(),

            'method' =>
                $method,

            'params' =>
                $params,
        ];

        /*
        |--------------------------------------------------------------------------
        | Restolution Basic Authentication
        |--------------------------------------------------------------------------
        |
        | api_key     = Restolution API Key
        | access_token = Restolution Secret
        |
        | With Basic Auth Restolution documentation states that apiKey
        | does not need to be present inside the request JSON.
        |
        */

        $response =
            Http::acceptJson()
                ->asForm()
                ->withBasicAuth(
                    (string)
                        $connection
                            ->api_key,

                    (string)
                        $connection
                            ->access_token
                )
                ->timeout(30)
                ->connectTimeout(10)
                ->post(
                    $this->baseUrl(
                        $connection
                    ),
                    [
                        'request' =>
                            json_encode(
                                $payload,
                                JSON_UNESCAPED_SLASHES
                            ),
                    ]
                );

        if (!$response->successful()) {
            throw new RuntimeException(
                'Restolution API returned HTTP '
                . $response->status()
                . '.'
            );
        }

        $json =
            $response->json();

        if (!is_array($json)) {
            throw new RuntimeException(
                'Restolution API returned an invalid response.'
            );
        }

        if (
            !($json[
                'success'
            ] ?? false)
        ) {
            $message =
                data_get(
                    $json,
                    'error.message'
                )
                ??
                data_get(
                    $json,
                    'message'
                )
                ??
                data_get(
                    $json,
                    'error'
                )
                ??
                'Restolution request failed.';

            if (is_array($message)) {
                $message =
                    json_encode(
                        $message
                    );
            }

            throw new RuntimeException(
                (string) $message
            );
        }

        $data =
            $json[
                'response'
            ]
            ?? [];

        return is_array($data)
            ? $data
            : [];
    }

    /*
    |--------------------------------------------------------------------------
    | RESTAURANTS
    |--------------------------------------------------------------------------
    */

    private function restaurants(
        PosConnection $connection,
        bool $includeArticles
    ): array {
        $params = [
            'includeArticles' =>
                $includeArticles,

            'includeBaseData' =>
                true,

            'includeCashRegisters' =>
                true,
        ];

        if (
            $connection
                ->external_merchant_id
        ) {
            $params[
                'businessUnitUUIDs'
            ] = [
                $connection
                    ->external_merchant_id,
            ];
        }

        $data =
            $this->call(
                $connection,
                'listRestaurants',
                $params
            );

        $restaurants =
            data_get(
                $data,
                'restaurants',
                []
            );

        return is_array(
            $restaurants
        )
            ? array_values(
                array_filter(
                    $restaurants,
                    'is_array'
                )
            )
            : [];
    }

    private function selectedRestaurant(
    PosConnection $connection,
    array $restaurants
): array {
    if (empty($restaurants)) {
        throw new RuntimeException(
            'No Restolution restaurant was found.'
        );
    }

    if (
        !$connection
            ->external_merchant_id
    ) {
        if (count($restaurants) === 1) {
            return $restaurants[0];
        }

        throw new RuntimeException(
            'Please select a Restolution restaurant.'
        );
    }

    foreach (
        $restaurants
        as $restaurant
    ) {
        if (!is_array($restaurant)) {
            continue;
        }

        $businessUnitUuid =
            $restaurant[
                'businessUnitUUID'
            ]
            ?? null;

        $restaurantId =
            $restaurant[
                'restaurantID'
            ]
            ?? null;

        if (
            $businessUnitUuid ===
                $connection
                    ->external_merchant_id
            ||
            $restaurantId ===
                $connection
                    ->external_merchant_id
        ) {
            return $restaurant;
        }
    }

    throw new RuntimeException(
        'Selected Restolution restaurant was not found.'
    );
}
    /*
    |--------------------------------------------------------------------------
    | RECEIPT NORMALIZATION
    |--------------------------------------------------------------------------
    */

    private function normalizeReceipt(
        array $receipt
    ): ?array {
        $externalOrderId =
            $receipt[
                'receiptUUID'
            ]
            ??
            $receipt[
                'receiptID'
            ]
            ??
            null;

        if (!$externalOrderId) {
            return null;
        }

        $receiptRows =
            $receipt[
                'receiptRows'
            ]
            ?? [];

        if (!is_array($receiptRows)) {
            $receiptRows = [];
        }

        $paymentRows =
            $receipt[
                'paymentRows'
            ]
            ?? [];

        if (!is_array($paymentRows)) {
            $paymentRows = [];
        }

        $items = [];

        $subtotal = 0.0;

        foreach (
            $receiptRows
            as $index => $row
        ) {
            if (!is_array($row)) {
                continue;
            }

            /*
             * Restolution quantity is 1/1000 units.
             */
            $quantity =
                ((float) (
                    $row[
                        'quantity'
                    ]
                    ?? 1000
                )) / 1000;

            if ($quantity <= 0) {
                $quantity = 1;
            }

            $unitPrice =
                $this->money(
                    $row[
                        'price'
                    ]
                    ?? 0
                );

            $rowTotal =
                array_key_exists(
                    'amount',
                    $row
                )
                    ? $this->money(
                        $row[
                            'amount'
                        ]
                    )
                    : (
                        $unitPrice
                        *
                        $quantity
                    );

            $subtotal +=
                $rowTotal;

            $items[] = [
                'external_item_id' =>
                    $row[
                        'saleID'
                    ]
                    ??
                    (
                        $externalOrderId
                        . ':'
                        . $index
                    ),

                'external_menu_item_id' =>
                    $row[
                        'articleID'
                    ]
                    ??
                    null,

                'item_name' =>
                    $row[
                        'additionalArticleName'
                    ]
                    ??
                    $row[
                        'articleName'
                    ]
                    ??
                    'Restolution Item',

                'unit_price' =>
                    round(
                        $unitPrice,
                        2
                    ),

                'quantity' =>
                    $quantity,

                'total_price' =>
                    round(
                        $rowTotal,
                        2
                    ),

                'modifiers' =>
                    [],

                'raw_data' =>
                    $row,
            ];
        }

        $payments = [];

        $paymentTotal =
            0.0;

        foreach (
            $paymentRows
            as $index => $payment
        ) {
            if (
                !is_array(
                    $payment
                )
            ) {
                continue;
            }

            $amount =
                $this->money(
                    $payment[
                        'amount'
                    ]
                    ?? 0
                );

            $paymentTotal +=
                $amount;

            $payments[] = [
                'external_payment_id' =>
                    $payment[
                        'transactionId'
                    ]
                    ??
                    $payment[
                        'paymentTerminalTransactionNumber'
                    ]
                    ??
                    (
                        $externalOrderId
                        . ':payment:'
                        . $index
                    ),

                'type' =>
                    strtolower(
                        (string) (
                            $payment[
                                'paymentName'
                            ]
                            ??
                            $payment[
                                'paymentCode'
                            ]
                            ??
                            'unknown'
                        )
                    ),

                'card_type' =>
                    null,

                'amount' =>
                    round(
                        $amount,
                        2
                    ),

                'tip_amount' =>
                    $this->money(
                        $payment[
                            'tip'
                        ]
                        ?? 0
                    ),

                'status' =>
                    'paid',

                'paid_at' =>
                    $payment[
                        'transactionTimestamp'
                    ]
                    ??
                    $payment[
                        'timestamp'
                    ]
                    ??
                    $receipt[
                        'timestamp'
                    ]
                    ??
                    null,

                'raw_data' =>
                    $payment,
            ];
        }

        $receiptType =
            strtoupper(
                (string) (
                    $receipt[
                        'receiptType'
                    ]
                    ?? 'NORMAL'
                )
            );

        $cancelled =
            $receiptType ===
                'VOID';

        return [
            'external_order_id' =>
                (string)
                    $externalOrderId,

            'source' =>
                'restolution',

            'external_location_id' =>
                $receipt[
                    'businessUnitUUID'
                ]
                ??
                $receipt[
                    'restaurantID'
                ]
                ??
                null,

            'order_type' =>
                !empty(
                    $receipt[
                        'tableCode'
                    ]
                )
                    ? 'dine_in'
                    : 'takeaway',

            'table_number' =>
                $receipt[
                    'tableCode'
                ]
                ??
                null,

            'customer_name' =>
                $receipt[
                    'customerName'
                ]
                ??
                'POS Customer',

            'customer_phone' =>
                'N/A',

            'customer_email' =>
                null,

            'delivery_address' =>
                null,

            'subtotal' =>
                round(
                    $subtotal,
                    2
                ),

            'tax_amount' =>
                0,

            'delivery_charge' =>
                0,

            'tip_amount' =>
                round(
                    collect(
                        $payments
                    )->sum(
                        'tip_amount'
                    ),
                    2
                ),

            'total' =>
                round(
                    $paymentTotal > 0
                        ? $paymentTotal
                        : $subtotal,
                    2
                ),

            'status' =>
                $cancelled
                    ? 'cancelled'
                    : 'completed',

            'payment_status' =>
                $cancelled
                    ? 'cancelled'
                    : (
                        count(
                            $payments
                        ) > 0
                            ? 'paid'
                            : 'pending'
                    ),

            'payment_id' =>
                $payments[0][
                    'external_payment_id'
                ]
                ?? null,

            'payment_method' =>
                $payments[0][
                    'type'
                ]
                ?? null,

            'special_instructions' =>
                $receipt[
                    'freeText'
                ]
                ??
                $receipt[
                    'memoInfo'
                ]
                ??
                null,

            'pos_created_at' =>
                $receipt[
                    'timestamp'
                ]
                ??
                null,

            'pos_updated_at' =>
                $receipt[
                    'timestamp'
                ]
                ??
                null,

            'items' =>
                $items,

            'payments' =>
                $payments,

            'raw_data' =>
                $receipt,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    private function articlePrice(
        array $article
    ): float {
        $prices =
            $article[
                'prices'
            ]
            ?? [];

        if (!is_array($prices)) {
            return 0;
        }

        foreach (
            $prices
            as $price
        ) {
            if (!is_array($price)) {
                continue;
            }

            /*
             * Article response can contain either direct Price objects
             * or price-list objects containing nested prices.
             */

            if (
                isset(
                    $price[
                        'price'
                    ]
                )
            ) {
                return $this->money(
                    $price[
                        'price'
                    ]
                );
            }

            if (
                isset(
                    $price[
                        'priceWithTax'
                    ]
                )
            ) {
                return $this->money(
                    $price[
                        'priceWithTax'
                    ]
                );
            }

            $nested =
                $price[
                    'prices'
                ]
                ?? [];

            if (!is_array($nested)) {
                continue;
            }

            foreach (
                $nested
                as $nestedPrice
            ) {
                if (
                    !is_array(
                        $nestedPrice
                    )
                ) {
                    continue;
                }

                if (
                    isset(
                        $nestedPrice[
                            'price'
                        ]
                    )
                ) {
                    return $this->money(
                        $nestedPrice[
                            'price'
                        ]
                    );
                }

                if (
                    isset(
                        $nestedPrice[
                            'priceWithTax'
                        ]
                    )
                ) {
                    return $this->money(
                        $nestedPrice[
                            'priceWithTax'
                        ]
                    );
                }
            }
        }

        return 0;
    }

    private function money(
        mixed $value
    ): float {
        /*
         * Restolution monetary amounts are cents.
         */
        return round(
            ((float) $value)
            / 100,
            2
        );
    }

    private function validateConnection(
        PosConnection $connection
    ): void {
        if (
            !$connection
                ->base_url
        ) {
            throw new RuntimeException(
                'Restolution API Base URL is required.'
            );
        }

        if (
            !$connection
                ->api_key
        ) {
            throw new RuntimeException(
                'Restolution API Key is required.'
            );
        }

        if (
            !$connection
                ->access_token
        ) {
            throw new RuntimeException(
                'Restolution Secret is required.'
            );
        }

        $this->baseUrl(
            $connection
        );
    }

    private function baseUrl(
        PosConnection $connection
    ): string {
        return PosUrlValidator::validate(
            (string)
                $connection
                    ->base_url
        );
    }
}