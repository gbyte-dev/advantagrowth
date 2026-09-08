<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Models\User;
use App\Services\Auth\EmailOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class PasswordResetController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otpService
    ) {
    }

    /**
     * Send a password-reset OTP.
     */
    public function requestOtp(
        Request $request
    ): JsonResponse {
        $validated =
            $request->validate([
                'email' => [
                    'required',
                    'email',
                    'max:255',
                ],
            ]);

        $email =
            strtolower(
                trim(
                    $validated['email']
                )
            );

        $user =
            User::query()
                ->whereIn(
                    'role',
                    [
                        'owner',
                        'staff',
                    ]
                )
                ->where(
                    'email',
                    $email
                )
                ->first();

        /*
         * This response intentionally does not
         * reveal whether an account exists.
         */
        $genericResponse = [
            'success' =>
                true,

            'message' =>
                'If an account exists for this email, a password reset code has been sent.',

            'data' => [
                'email' =>
                    $email,

                'expires_in_minutes' =>
                    EmailOtp::
                        EXPIRY_MINUTES,

                'resend_after_seconds' =>
                    EmailOtp::
                        RESEND_COOLDOWN_SECONDS,
            ],
        ];

        if (!$user) {
            return response()->json(
                $genericResponse
            );
        }

        try {
            $this
                ->otpService
                ->sendOtp(
                    $user,
                    EmailOtp::
                        PURPOSE_PASSWORD_RESET
                );
        } catch (
            ValidationException $exception
        ) {
            /*
             * Preserve resend cooldown validation.
             */
            throw $exception;
        } catch (Throwable $exception) {
            Log::error(
                'Password reset OTP email failed.',
                [
                    'user_id' =>
                        $user->id,

                    'error' =>
                        $exception->getMessage(),
                ]
            );

            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'Unable to send the password reset email. Please try again.',
            ], 503);
        }

        return response()->json(
            $genericResponse
        );
    }

    /**
     * Verify the OTP and set the new password.
     */
    public function reset(
        Request $request
    ): JsonResponse {
        $validated =
            $request->validate([
                'email' => [
                    'required',
                    'email',
                    'max:255',
                ],

                'otp' => [
                    'required',
                    'string',
                    'digits:6',
                ],

                'new_password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
            ]);

        $email =
            strtolower(
                trim(
                    $validated['email']
                )
            );

        $user =
            User::query()
                ->whereIn(
                    'role',
                    [
                        'owner',
                        'staff',
                    ]
                )
                ->where(
                    'email',
                    $email
                )
                ->first();

        /*
         * Do not reveal whether the submitted
         * email address belongs to an account.
         */
        if (!$user) {
            throw ValidationException::
                withMessages([
                    'otp' => [
                        'The verification code is invalid or no longer available.',
                    ],
                ]);
        }

        $this
            ->otpService
            ->resetPassword(
                $user,
                trim(
                    $validated['otp']
                ),
                $validated['new_password']
            );

        return response()->json([
            'success' =>
                true,

            'message' =>
                'Password reset successfully. Please login with your new password.',
        ]);
    }
}