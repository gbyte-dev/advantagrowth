<?php

namespace Tests\Feature;

use App\Mail\SendOtpMail;
use App\Models\EmailOtp;
use App\Models\User;
use App\Services\Auth\EmailOtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetOtpTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
    }

    private function createOwner(
        string $suffix = 'one'
    ): User {
        $user =
            User::create([
                'restaurant_id' =>
                    null,

                'owner_name' =>
                    "Password Reset Owner {$suffix}",

                'email' =>
                    "password-reset-{$suffix}@example.com",

                'phone' =>
                    '9876543210',

                'password' =>
                    Hash::make(
                        'old-password123'
                    ),

                'role' =>
                    'owner',

                'is_active' =>
                    true,
            ]);

        $user->forceFill([
            'email_verified_at' =>
                now(),
        ])->save();

        return $user->fresh();
    }

    private function requestResetOtp(
        User $user
    ): string {
        $this->postJson(
            '/api/auth/password/forgot',
            [
                'email' =>
                    $user->email,
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.email',
                $user->email
            )
            ->assertJsonPath(
                'data.expires_in_minutes',
                EmailOtp::EXPIRY_MINUTES
            )
            ->assertJsonPath(
                'data.resend_after_seconds',
                EmailOtp::
                    RESEND_COOLDOWN_SECONDS
            );

        $plainOtp =
            null;

        Mail::assertSent(
            SendOtpMail::class,
            function (
                SendOtpMail $mail
            ) use (
                $user,
                &$plainOtp
            ): bool {
                if (
                    $mail->purpose !==
                    EmailOtp::
                        PURPOSE_PASSWORD_RESET
                ) {
                    return false;
                }

                if (
                    !$mail->hasTo(
                        $user->email
                    )
                ) {
                    return false;
                }

                $plainOtp =
                    $mail->otp;

                return true;
            }
        );

        $this->assertNotNull(
            $plainOtp
        );

        return (string) $plainOtp;
    }

    public function test_existing_account_receives_password_reset_otp(): void
    {
        $user =
            $this->createOwner(
                'send'
            );

        $this->requestResetOtp(
            $user
        );

        $this->assertDatabaseHas(
            'email_otps',
            [
                'user_id' =>
                    $user->id,

                'purpose' =>
                    EmailOtp::
                        PURPOSE_PASSWORD_RESET,

                'attempts' =>
                    0,

                'verified_at' =>
                    null,

                'consumed_at' =>
                    null,
            ]
        );
    }

    public function test_unknown_email_does_not_reveal_account_existence(): void
    {
        $this->postJson(
            '/api/auth/password/forgot',
            [
                'email' =>
                    'unknown-user@example.com',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'message',
                'If an account exists for this email, a password reset code has been sent.'
            );

        Mail::assertNothingSent();
    }

    public function test_incorrect_password_reset_otp_is_rejected_and_attempt_is_saved(): void
    {
        $user =
            $this->createOwner(
                'wrong'
            );

        $plainOtp =
            $this->requestResetOtp(
                $user
            );

        $wrongOtp =
            $plainOtp === '000000'
                ? '000001'
                : '000000';

        $this->postJson(
            '/api/auth/password/reset',
            [
                'email' =>
                    $user->email,

                'otp' =>
                    $wrongOtp,

                'new_password' =>
                    'new-password123',

                'new_password_confirmation' =>
                    'new-password123',
            ]
        )->assertUnprocessable();

        $this->assertDatabaseHas(
            'email_otps',
            [
                'user_id' =>
                    $user->id,

                'purpose' =>
                    EmailOtp::
                        PURPOSE_PASSWORD_RESET,

                'attempts' =>
                    1,
            ]
        );

        $this->assertTrue(
            Hash::check(
                'old-password123',
                $user->fresh()->password
            )
        );
    }

    public function test_correct_otp_resets_password_and_consumes_code(): void
    {
        $user =
            $this->createOwner(
                'success'
            );

        $plainOtp =
            $this->requestResetOtp(
                $user
            );

        $this->postJson(
            '/api/auth/password/reset',
            [
                'email' =>
                    $user->email,

                'otp' =>
                    $plainOtp,

                'new_password' =>
                    'new-password123',

                'new_password_confirmation' =>
                    'new-password123',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            );

        $user->refresh();

        $this->assertTrue(
            Hash::check(
                'new-password123',
                $user->password
            )
        );

        $otpRecord =
            EmailOtp::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->where(
                    'purpose',
                    EmailOtp::
                        PURPOSE_PASSWORD_RESET
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

    public function test_password_reset_revokes_existing_tokens(): void
    {
        $user =
            $this->createOwner(
                'tokens'
            );

        $token =
            $user->createToken(
                'existing-login'
            );

        $tokenId =
            $token
                ->accessToken
                ->id;

        $this->assertDatabaseHas(
            'personal_access_tokens',
            [
                'id' =>
                    $tokenId,
            ]
        );

        $plainOtp =
            $this->requestResetOtp(
                $user
            );

        $this->postJson(
            '/api/auth/password/reset',
            [
                'email' =>
                    $user->email,

                'otp' =>
                    $plainOtp,

                'new_password' =>
                    'new-password123',

                'new_password_confirmation' =>
                    'new-password123',
            ]
        )->assertOk();

        $this->assertDatabaseMissing(
            'personal_access_tokens',
            [
                'id' =>
                    $tokenId,
            ]
        );
    }

    public function test_old_password_fails_and_new_password_can_login(): void
    {
        $user =
            $this->createOwner(
                'login'
            );

        $plainOtp =
            $this->requestResetOtp(
                $user
            );

        $this->postJson(
            '/api/auth/password/reset',
            [
                'email' =>
                    $user->email,

                'otp' =>
                    $plainOtp,

                'new_password' =>
                    'new-password123',

                'new_password_confirmation' =>
                    'new-password123',
            ]
        )->assertOk();

        $this->postJson(
            '/api/auth/login',
            [
                'login' =>
                    $user->email,

                'password' =>
                    'old-password123',
            ]
        )->assertUnauthorized();

        $this->postJson(
            '/api/auth/login',
            [
                'login' =>
                    $user->email,

                'password' =>
                    'new-password123',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            );
    }

    public function test_registration_otp_cannot_reset_password(): void
    {
        $user =
            $this->createOwner(
                'purpose'
            );

        $otpService =
            app(
                EmailOtpService::class
            );

        $otpService->sendOtp(
            $user,
            EmailOtp::
                PURPOSE_EMAIL_VERIFICATION
        );

        $registrationOtp =
            null;

        Mail::assertSent(
            SendOtpMail::class,
            function (
                SendOtpMail $mail
            ) use (
                &$registrationOtp
            ): bool {
                if (
                    $mail->purpose !==
                    EmailOtp::
                        PURPOSE_EMAIL_VERIFICATION
                ) {
                    return false;
                }

                $registrationOtp =
                    $mail->otp;

                return true;
            }
        );

        $this->assertNotNull(
            $registrationOtp
        );

        $this->postJson(
            '/api/auth/password/reset',
            [
                'email' =>
                    $user->email,

                'otp' =>
                    $registrationOtp,

                'new_password' =>
                    'new-password123',

                'new_password_confirmation' =>
                    'new-password123',
            ]
        )->assertUnprocessable();

        $this->assertTrue(
            Hash::check(
                'old-password123',
                $user->fresh()->password
            )
        );
    }

    public function test_password_reset_otp_resend_has_cooldown(): void
    {
        $user =
            $this->createOwner(
                'cooldown'
            );

        $this->requestResetOtp(
            $user
        );

        $this->postJson(
            '/api/auth/password/forgot',
            [
                'email' =>
                    $user->email,
            ]
        )->assertUnprocessable();

        $this->travel(
            EmailOtp::
                RESEND_COOLDOWN_SECONDS
            + 1
        )->seconds();

        $this->postJson(
            '/api/auth/password/forgot',
            [
                'email' =>
                    $user->email,
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            );

        Mail::assertSentCount(2);
    }
}