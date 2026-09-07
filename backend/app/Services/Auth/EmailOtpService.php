<?php

namespace App\Services\Auth;

use App\Mail\SendOtpMail;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class EmailOtpService
{
    /**
     * Generate, store and email a new OTP.
     */
    public function sendOtp(
        User $user,
        string $purpose
    ): EmailOtp {
        $this->ensureSupportedPurpose(
            $purpose
        );

        $latestOtp =
            EmailOtp::query()
                ->where(
                    'user_id',
                    $user->id
                )
                ->where(
                    'purpose',
                    $purpose
                )
                ->whereNull(
                    'consumed_at'
                )
                ->latest('id')
                ->first();

        /*
         * Prevent repeated email requests.
         */
        if (
            $latestOtp?->sent_at
        ) {
            $availableAt =
                $latestOtp
                    ->sent_at
                    ->copy()
                    ->addSeconds(
                        EmailOtp::
                            RESEND_COOLDOWN_SECONDS
                    );

            if (
                now()->lessThan(
                    $availableAt
                )
            ) {
                $seconds =
                    (int) ceil(
                        now()->diffInSeconds(
                            $availableAt
                        )
                    );

                throw ValidationException::
                    withMessages([
                        'email' => [
                            "Please wait {$seconds} seconds before requesting another code.",
                        ],
                    ]);
            }
        }

        $plainOtp =
            (string) random_int(
                100000,
                999999
            );

        /*
         * Invalidate older unused codes for
         * this user and purpose.
         */
        EmailOtp::query()
            ->where(
                'user_id',
                $user->id
            )
            ->where(
                'purpose',
                $purpose
            )
            ->whereNull(
                'consumed_at'
            )
            ->update([
                'consumed_at' =>
                    now(),
            ]);

        $emailOtp =
            EmailOtp::create([
                'user_id' =>
                    $user->id,

                'purpose' =>
                    $purpose,

                /*
                 * Never store the plain OTP.
                 */
                'otp' =>
                    Hash::make(
                        $plainOtp
                    ),

                'attempts' =>
                    0,

                'sent_at' =>
                    now(),

                'expires_at' =>
                    now()->addMinutes(
                        EmailOtp::
                            EXPIRY_MINUTES
                    ),

                'verified_at' =>
                    null,

                'consumed_at' =>
                    null,

                'reset_token_hash' =>
                    null,
            ]);

        try {
            Mail::to(
                $user->email
            )->send(
                new SendOtpMail(
                $plainOtp,
                $this->accountName(
                    $user
                ),
                EmailOtp::
                    EXPIRY_MINUTES,
                $purpose
            )
            );
        } catch (Throwable $exception) {
            /*
             * Do not leave a usable OTP when
             * its email could not be sent.
             */
            $emailOtp->delete();

            throw $exception;
        }

        return $emailOtp;
    }

    /**
     * Verify a submitted OTP.
     */
    public function verifyOtp(
        User $user,
        string $purpose,
        string $plainOtp
    ): EmailOtp {
        $this->ensureSupportedPurpose(
            $purpose
        );

        return DB::transaction(
            function () use (
                $user,
                $purpose,
                $plainOtp
            ): EmailOtp {
                $emailOtp =
                    EmailOtp::query()
                        ->where(
                            'user_id',
                            $user->id
                        )
                        ->where(
                            'purpose',
                            $purpose
                        )
                        ->whereNull(
                            'consumed_at'
                        )
                        ->latest('id')
                        ->lockForUpdate()
                        ->first();

                if (!$emailOtp) {
                    throw ValidationException::
                        withMessages([
                            'otp' => [
                                'The verification code is invalid or no longer available.',
                            ],
                        ]);
                }

                if (
                    $emailOtp
                        ->isVerified()
                ) {
                    throw ValidationException::
                        withMessages([
                            'otp' => [
                                'This verification code has already been used.',
                            ],
                        ]);
                }

                if (
                    $emailOtp
                        ->isExpired()
                ) {
                    $emailOtp->update([
                        'consumed_at' =>
                            now(),
                    ]);

                    throw ValidationException::
                        withMessages([
                            'otp' => [
                                'The verification code has expired. Please request a new code.',
                            ],
                        ]);
                }

                if (
                    $emailOtp
                        ->hasTooManyAttempts()
                ) {
                    $emailOtp->update([
                        'consumed_at' =>
                            now(),
                    ]);

                    throw ValidationException::
                        withMessages([
                            'otp' => [
                                'Too many incorrect attempts. Please request a new code.',
                            ],
                        ]);
                }

                if (
                    !Hash::check(
                        $plainOtp,
                        $emailOtp->otp
                    )
                ) {
                    $attempts =
                        $emailOtp->attempts
                        + 1;

                    $emailOtp->attempts =
                        $attempts;

                    if (
                        $attempts >=
                        EmailOtp::MAX_ATTEMPTS
                    ) {
                        $emailOtp->consumed_at =
                            now();
                    }

                    $emailOtp->save();

                    $remaining =
                        max(
                            0,
                            EmailOtp::MAX_ATTEMPTS
                            - $attempts
                        );

                    throw ValidationException::
                        withMessages([
                            'otp' => [
                                $remaining > 0
                                    ? "Incorrect verification code. {$remaining} attempts remaining."
                                    : 'Too many incorrect attempts. Please request a new code.',
                            ],
                        ]);
                }

                $emailOtp->update([
                    'verified_at' =>
                        now(),
                ]);

                return $emailOtp->fresh();
            }
        );
    }

    /**
     * Ensure callers cannot create arbitrary
     * OTP purposes.
     */
    private function ensureSupportedPurpose(
        string $purpose
    ): void {
        if (
            !in_array(
                $purpose,
                [
                    EmailOtp::
                        PURPOSE_EMAIL_VERIFICATION,

                    EmailOtp::
                        PURPOSE_PASSWORD_RESET,
                ],
                true
            )
        ) {
            throw new RuntimeException(
                'Unsupported email OTP purpose.'
            );
        }
    }

    private function accountName(
        User $user
    ): string {
        $name =
            trim(
                (string)
                $user->owner_name
            );

        return $name !== ''
            ? $name
            : 'there';
    }
}