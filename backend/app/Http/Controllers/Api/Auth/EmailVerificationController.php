<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\User;
use App\Services\Auth\EmailOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
     * Verify the OTP and activate owner login.
     */
    public function verify(
        VerifyOtpRequest $request
    ): JsonResponse {
        $validated =
            $request->validated();

        $user =
            User::query()
                ->where(
                    'role',
                    'owner'
                )
                ->where(
                    'email',
                    $validated['email']
                )
                ->first();

        /*
         * Do not reveal whether the email exists.
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

        $this
    ->otpService
    ->verifyOtp(
        $user,
        $validated['otp']
    );
        return response()->json([
            'success' =>
                true,

            'message' =>
                'Email verified successfully. You can now login.',
        ]);
    }

    /**
     * Resend a registration OTP.
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
         * Same response for unknown and already
         * verified accounts.
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
            $this
                ->otpService
                ->sendOtp(
                    $user
                );
        } catch (
            ValidationException $exception
        ) {
            /*
             * Preserve cooldown validation response.
             */
            throw $exception;
        } catch (Throwable $exception) {
            Log::error(
                'Registration OTP resend failed.',
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
                    'Unable to send the verification email. Please try again.',
            ], 503);
        }

        return response()->json(
            $genericResponse
        );
    }
}