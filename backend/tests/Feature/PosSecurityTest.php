<?php

namespace Tests\Feature;

use App\Models\PosConnection;
use App\Models\Restaurant;
use App\Services\POS\PosUrlValidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class PosSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function createConnection(): PosConnection
    {
        $restaurant = Restaurant::create([
            'name' => 'Security Test Restaurant',
            'slug' => 'security-test-restaurant',
            'phone' => '9999999999',
            'email' => 'security@example.com',
            'is_active' => true,
        ]);

        return PosConnection::create([
            'restaurant_id' =>
                $restaurant->id,

            'provider' =>
                'Custom API',

            'label' =>
                'Security Test POS',

            'api_key' =>
                'secret-api-key',

            'access_token' =>
                'secret-access-token',

            'base_url' =>
                'http://127.0.0.1:8000/api/mock-pos',

            'status' =>
                'connected',

            'is_active' =>
                true,
        ]);
    }

    public function test_pos_credentials_are_encrypted_and_hidden_from_serialization(): void
    {
        $connection =
            $this->createConnection();

        $raw =
            DB::table('pos_connections')
                ->where(
                    'id',
                    $connection->id
                )
                ->first([
                    'api_key',
                    'access_token',
                ]);

        $this->assertNotNull(
            $raw
        );

        $this->assertNotSame(
            'secret-api-key',
            $raw->api_key
        );

        $this->assertNotSame(
            'secret-access-token',
            $raw->access_token
        );

        $this->assertSame(
            'secret-api-key',
            $connection->api_key
        );

        $this->assertSame(
            'secret-access-token',
            $connection->access_token
        );

        $serialized =
            $connection->toArray();

        $this->assertArrayNotHasKey(
            'api_key',
            $serialized
        );

        $this->assertArrayNotHasKey(
            'access_token',
            $serialized
        );
    }

    public function test_local_mock_url_is_allowed_in_testing_environment(): void
    {
        $url =
            PosUrlValidator::validate(
                'http://127.0.0.1:8000/api/mock-pos'
            );

        $this->assertSame(
            'http://127.0.0.1:8000/api/mock-pos',
            $url
        );
    }

    public function test_private_ip_is_blocked(): void
    {
        $this->expectException(
            RuntimeException::class
        );

        $this->expectExceptionMessage(
            'private, local or reserved network address'
        );

        PosUrlValidator::validate(
            'https://192.168.1.10/api'
        );
    }

    public function test_cloud_metadata_ip_is_blocked(): void
    {
        $this->expectException(
            RuntimeException::class
        );

        $this->expectExceptionMessage(
            'private, local or reserved network address'
        );

        PosUrlValidator::validate(
            'https://169.254.169.254/latest/meta-data'
        );
    }

    public function test_embedded_url_credentials_are_blocked(): void
    {
        $this->expectException(
            RuntimeException::class
        );

        $this->expectExceptionMessage(
            'must not contain embedded credentials'
        );

        PosUrlValidator::validate(
            'https://admin:secret@example.com/api'
        );
    }

    public function test_invalid_url_scheme_is_blocked(): void
    {
        $this->expectException(
            RuntimeException::class
        );

        PosUrlValidator::validate(
            'file:///etc/passwd'
        );
    }
}