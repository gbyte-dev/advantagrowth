<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Models\User;
use App\Services\Auth\EmailOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class EmailVerificationController extends Controller
{
    public function __construct(
        private readonly EmailOtpService $otpService
    ) {
    }

    /**
     * Verify the registration email OTP.
     */
    public function verify(
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
                    'digits:6',
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
                ->where(
                    'role',
                    'owner'
                )
                ->where(
                    'email',
                    $email
                )
                ->first();

        /*
         * Do not reveal whether an account exists.
         */
        if (!$user) {
            throw ValidationException::
                withMessages([
                    'otp' => [
                        'The verification code is invalid or no longer available.',
                    ],
                ]);
        }

        if (
            $user->email_verified_at
        ) {
            return response()->json([
                'success' =>
                    true,

                'message' =>
                    'Email address is already verified. You can login.',
            ]);
        }

        $emailOtp =
            $this->otpService
                ->verifyOtp(
                    $user,
                    EmailOtp::
                        PURPOSE_EMAIL_VERIFICATION,
                    $validated['otp']
                );

        DB::transaction(
            function () use (
                $user,
                $emailOtp
            ): void {
                $user->forceFill([
                    'email_verified_at' =>
                        now(),
                ])->save();

                $emailOtp->update([
                    'consumed_at' =>
                        now(),
                ]);
            }
        );

        return response()->json([
            'success' =>
                true,

            'message' =>
                'Email verified successfully. You can now login.',
        ]);
    }

    /**
     * Resend the registration verification OTP.
     */
    public function resend(
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
                ->where(
                    'role',
                    'owner'
                )
                ->where(
                    'email',
                    $email
                )
                ->first();

        $genericResponse = [
            'success' =>
                true,

            'message' =>
                'If an unverified account exists for this email, a verification code has been sent.',
        ];

        /*
         * Keep the response identical for unknown
         * and already-verified accounts.
         */
        if (
            !$user ||
            $user->email_verified_at
        ) {
            return response()->json(
                $genericResponse
            );
        }

        try {
            $this->otpService
                ->sendOtp(
                    $user,
                    EmailOtp::
                        PURPOSE_EMAIL_VERIFICATION
                );
        } catch (
            ValidationException $exception
        ) {
            throw $exception;
        } catch (Throwable $exception) {
            Log::error(
                'Registration verification email failed.',
                [
                    'user_id' =>
                        $user->id,

                    'exception' =>
                        $exception,
                ]
            );

            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'Unable to send the verification email. Please try again.',
            ], 503);
        }

        return response()->json(
            $genericResponse
        );
    }
}