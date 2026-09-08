<?php

namespace App\Services\Auth;

use App\Mail\SendOtpMail;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Throwable;

class EmailOtpService
{
    /**
     * Generate, securely store and email an OTP.
     */
    public function sendOtp(
        User $user,
        string $purpose =
            EmailOtp::PURPOSE_EMAIL_VERIFICATION
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
         * Prevent repeated email requests during
         * the configured cooldown period.
         */
        if ($latestOtp?->sent_at) {
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
         * Only the OTP hash is stored.
         */
        $newOtp =
            EmailOtp::create([
                'user_id' =>
                    $user->id,

                'purpose' =>
                    $purpose,

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
             * its email was not delivered.
             */
            $newOtp->delete();

            throw $exception;
        }

        /*
         * The new email was sent successfully,
         * therefore older OTPs of the same
         * purpose can be invalidated.
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
            ->where(
                'id',
                '!=',
                $newOtp->id
            )
            ->whereNull(
                'consumed_at'
            )
            ->update([
                'consumed_at' =>
                    now(),
            ]);

        return $newOtp->fresh();
    }

    /**
     * Verify a registration OTP and activate
     * the owner's email address.
     */
    public function verifyOtp(
        User $user,
        string $plainOtp
    ): EmailOtp {
        return $this->verifyAndConsume(
            $user,
            $plainOtp,
            EmailOtp::
                PURPOSE_EMAIL_VERIFICATION,

            function (
                EmailOtp $emailOtp,
                $verifiedAt
            ) use (
                $user
            ): void {
                $user->forceFill([
                    'email_verified_at' =>
                        $verifiedAt,
                ])->save();
            }
        );
    }

    /**
     * Verify a password-reset OTP, replace the
     * password and revoke every existing token.
     */
    public function resetPassword(
        User $user,
        string $plainOtp,
        string $newPassword
    ): EmailOtp {
        return $this->verifyAndConsume(
            $user,
            $plainOtp,
            EmailOtp::
                PURPOSE_PASSWORD_RESET,

            function (
                EmailOtp $emailOtp,
                $verifiedAt
            ) use (
                $user,
                $newPassword
            ): void {
                $user->forceFill([
                    'password' =>
                        Hash::make(
                            $newPassword
                        ),
                ])->save();

                $user
                    ->tokens()
                    ->delete();
            }
        );
    }

    /**
     * Verify and consume an OTP atomically.
     *
     * Errors are returned from the transaction
     * first so incorrect-attempt updates remain
     * saved before ValidationException is thrown.
     */
    private function verifyAndConsume(
        User $user,
        string $plainOtp,
        string $purpose,
        callable $onVerified
    ): EmailOtp {
        $this->ensureSupportedPurpose(
            $purpose
        );

        $result =
            DB::transaction(
                function () use (
                    $user,
                    $plainOtp,
                    $purpose,
                    $onVerified
                ): array {
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
                        return [
                            'error' =>
                                'The verification code is invalid or no longer available.',
                        ];
                    }

                    if (
                        $emailOtp
                            ->isVerified()
                    ) {
                        return [
                            'error' =>
                                'This verification code has already been used.',
                        ];
                    }

                    if (
                        $emailOtp
                            ->isExpired()
                    ) {
                        $emailOtp->update([
                            'consumed_at' =>
                                now(),
                        ]);

                        return [
                            'error' =>
                                'The verification code has expired. Please request a new code.',
                        ];
                    }

                    if (
                        $emailOtp
                            ->hasTooManyAttempts()
                    ) {
                        $emailOtp->update([
                            'consumed_at' =>
                                now(),
                        ]);

                        return [
                            'error' =>
                                'Too many incorrect attempts. Please request a new code.',
                        ];
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
                            EmailOtp::
                                MAX_ATTEMPTS
                        ) {
                            $emailOtp->consumed_at =
                                now();
                        }

                        $emailOtp->save();

                        $remaining =
                            max(
                                0,
                                EmailOtp::
                                    MAX_ATTEMPTS
                                - $attempts
                            );

                        return [
                            'error' =>
                                $remaining > 0
                                    ? "Incorrect verification code. {$remaining} attempts remaining."
                                    : 'Too many incorrect attempts. Please request a new code.',
                        ];
                    }

                    $verifiedAt =
                        now();

                    $onVerified(
                        $emailOtp,
                        $verifiedAt
                    );

                    $emailOtp->forceFill([
                        'verified_at' =>
                            $verifiedAt,

                        'consumed_at' =>
                            $verifiedAt,
                    ])->save();

                    return [
                        'otp' =>
                            $emailOtp->fresh(),
                    ];
                }
            );

        if (
            isset(
                $result['error']
            )
        ) {
            throw ValidationException::
                withMessages([
                    'otp' => [
                        $result['error'],
                    ],
                ]);
        }

        return $result['otp'];
    }

    /**
     * Reject unknown OTP purposes.
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
            throw new InvalidArgumentException(
                'Unsupported email OTP purpose.'
            );
        }
    }

    /**
     * Name displayed inside the email.
     */
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