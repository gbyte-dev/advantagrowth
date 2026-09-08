<?php

namespace Tests\Feature;

use App\Mail\SendOtpMail;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationEmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function registrationData(
        string $suffix = 'one'
    ): array {
        return [
            'restaurant_name' =>
                "OTP Restaurant {$suffix}",

            'owner_name' =>
                "OTP Owner {$suffix}",

            'email' =>
                "otp-owner-{$suffix}@example.com",

            'phone' =>
                '9876543210',

            'password' =>
                'password123',

            'confirm_password' =>
                'password123',
        ];
    }

    private function registerAndGetOtp(
        string $suffix = 'one'
    ): array {
        Mail::fake();

        $data =
            $this->registrationData(
                $suffix
            );

        $this->postJson(
            '/api/auth/register',
            $data
        )
            ->assertCreated()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.email',
                $data['email']
            )
            ->assertJsonPath(
                'data.verification_required',
                true
            );

        $plainOtp =
            null;

        Mail::assertSent(
            SendOtpMail::class,
            function (
                SendOtpMail $mail
            ) use (
                $data,
                &$plainOtp
            ): bool {
                $plainOtp =
                    $mail->otp;

                return $mail->hasTo(
                    $data['email']
                );
            }
        );

        $this->assertNotNull(
            $plainOtp
        );

        return [
            $data,
            (string) $plainOtp,
        ];
    }

    public function test_registration_creates_unverified_owner_and_sends_otp(): void
    {
        Mail::fake();

        $data =
            $this->registrationData(
                'create'
            );

        $this->postJson(
            '/api/auth/register',
            $data
        )
            ->assertCreated()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.email',
                $data['email']
            )
            ->assertJsonPath(
                'data.verification_required',
                true
            )
            ->assertJsonPath(
                'data.expires_in_minutes',
                EmailOtp::EXPIRY_MINUTES
            )
            ->assertJsonPath(
                'data.resend_after_seconds',
                EmailOtp::RESEND_COOLDOWN_SECONDS
            );

        $user =
            User::query()
                ->where(
                    'email',
                    $data['email']
                )
                ->firstOrFail();

        $this->assertNull(
            $user->email_verified_at
        );

        $this->assertDatabaseHas(
            'email_otps',
            [
                'user_id' =>
                    $user->id,

                'purpose' =>
                    EmailOtp::
                        PURPOSE_EMAIL_VERIFICATION,

                'attempts' =>
                    0,
            ]
        );

        Mail::assertSent(
            SendOtpMail::class,
            function (
                SendOtpMail $mail
            ) use (
                $data
            ): bool {
                return $mail->hasTo(
                    $data['email']
                );
            }
        );
    }

    public function test_unverified_owner_cannot_login(): void
    {
        [$data] =
            $this->registerAndGetOtp(
                'blocked-login'
            );

        $this->postJson(
            '/api/auth/login',
            [
                'login' =>
                    $data['email'],

                'password' =>
                    $data['password'],
            ]
        )
            ->assertForbidden()
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'code',
                'EMAIL_NOT_VERIFIED'
            )
            ->assertJsonPath(
                'data.email',
                $data['email']
            );
    }

    public function test_owner_can_verify_registration_otp(): void
    {
        [$data, $plainOtp] =
            $this->registerAndGetOtp(
                'verify'
            );

        $this->postJson(
            '/api/auth/email/verify',
            [
                'email' =>
                    $data['email'],

                'otp' =>
                    $plainOtp,
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            );

        $user =
            User::query()
                ->where(
                    'email',
                    $data['email']
                )
                ->firstOrFail();

        $this->assertNotNull(
            $user->email_verified_at
        );

        $otpRecord =
            EmailOtp::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->latest('id')
                ->firstOrFail();

        $this->assertNotNull(
            $otpRecord->verified_at
        );

        $this->assertNotNull(
            $otpRecord->consumed_at
        );
    }

    public function test_verified_owner_can_login(): void
    {
        [$data, $plainOtp] =
            $this->registerAndGetOtp(
                'verified-login'
            );

        $this->postJson(
            '/api/auth/email/verify',
            [
                'email' =>
                    $data['email'],

                'otp' =>
                    $plainOtp,
            ]
        )->assertOk();

        $this->postJson(
            '/api/auth/login',
            [
                'login' =>
                    $data['email'],

                'password' =>
                    $data['password'],
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'role',
                'owner'
            )
            ->assertJsonStructure([
                'token',
                'user',
            ]);
    }

    public function test_incorrect_otp_is_rejected_and_attempt_is_saved(): void
    {
        [$data, $plainOtp] =
            $this->registerAndGetOtp(
                'wrong-otp'
            );

        $wrongOtp =
            $plainOtp === '000000'
                ? '000001'
                : '000000';

        $this->postJson(
            '/api/auth/email/verify',
            [
                'email' =>
                    $data['email'],

                'otp' =>
                    $wrongOtp,
            ]
        )->assertUnprocessable();

        $user =
            User::query()
                ->where(
                    'email',
                    $data['email']
                )
                ->firstOrFail();

        $this->assertNull(
            $user->email_verified_at
        );

        $this->assertDatabaseHas(
            'email_otps',
            [
                'user_id' =>
                    $user->id,

                'attempts' =>
                    1,
            ]
        );
    }

    public function test_owner_can_resend_registration_otp_after_cooldown(): void
    {
        [$data] =
            $this->registerAndGetOtp(
                'resend'
            );

        Mail::assertSentCount(1);

        $this
            ->travel(
                EmailOtp::
                    RESEND_COOLDOWN_SECONDS
                + 1
            )
            ->seconds();

        $this->postJson(
            '/api/auth/email/resend',
            [
                'email' =>
                    $data['email'],
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            );

        Mail::assertSentCount(2);

        $user =
            User::query()
                ->where(
                    'email',
                    $data['email']
                )
                ->firstOrFail();

        $this->assertSame(
            2,
            EmailOtp::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->count()
        );
    }
}