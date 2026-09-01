<?php

namespace App\Services\Subscription;

use Razorpay\Api\Api;
use RuntimeException;

class RazorpaySubscriptionService
{
    private Api $api;

    public function __construct()
    {
        $key = (string) config(
            'services.razorpay.key'
        );

        $secret = (string) config(
            'services.razorpay.secret'
        );

        if (
            $key === '' ||
            $secret === ''
        ) {
            throw new RuntimeException(
                'Razorpay credentials are not configured.'
            );
        }

        $this->api = new Api(
            $key,
            $secret
        );
    }

    public function createOrder(
        string $receipt,
        int $amountMinor,
        string $currency,
        array $notes = []
    ): array {
        if ($amountMinor < 1) {
            throw new RuntimeException(
                'Payment amount must be greater than zero.'
            );
        }

        $order = $this
            ->api
            ->order
            ->create([
                'receipt' => $receipt,
                'amount' => $amountMinor,
                'currency' => strtoupper(
                    $currency
                ),
                'notes' => $notes,
            ]);

        return $order->toArray();
    }

    public function verifyPaymentSignature(
        string $orderId,
        string $paymentId,
        string $signature
    ): void {
        $this
            ->api
            ->utility
            ->verifyPaymentSignature([
                'razorpay_order_id' =>
                    $orderId,

                'razorpay_payment_id' =>
                    $paymentId,

                'razorpay_signature' =>
                    $signature,
            ]);
    }

    public function verifyWebhookSignature(
        string $payload,
        string $signature
    ): void {
        $webhookSecret =
            (string) config(
                'services.razorpay.webhook_secret'
            );

        if ($webhookSecret === '') {
            throw new RuntimeException(
                'Razorpay webhook secret is not configured.'
            );
        }

        $this
            ->api
            ->utility
            ->verifyWebhookSignature(
                $payload,
                $signature,
                $webhookSecret
            );
    }

    public function fetchPayment(
        string $paymentId
    ): array {
        return $this
            ->api
            ->payment
            ->fetch($paymentId)
            ->toArray();
    }

    public function fetchOrder(
        string $orderId
    ): array {
        return $this
            ->api
            ->order
            ->fetch($orderId)
            ->toArray();
    }

    public function publicKey(): string
    {
        return (string) config(
            'services.razorpay.key'
        );
    }
}