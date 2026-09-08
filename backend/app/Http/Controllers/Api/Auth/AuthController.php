<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailOtp;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\Auth\EmailOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    public function register(
        Request $request,
        EmailOtpService $otpService
    ) {
        $validated = $request->validate([
            'restaurant_name' => [
                'required',
                'string',
                'max:255',
            ],

            'owner_name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
                'unique:restaurants,email',
            ],

            'phone' => [
                'required',
                'string',
                'max:20',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'confirm_password' => [
                'required',
                'same:password',
            ],
        ]);

        $email = strtolower(
            trim($validated['email'])
        );

        try {
            $user = DB::transaction(
                function () use (
                    $validated,
                    $email
                ): User {
                    $restaurant = Restaurant::create([
                        'name' => trim(
                            $validated['restaurant_name']
                        ),

                        'slug' => Str::slug(
                            $validated['restaurant_name']
                        )
                            . '-'
                            . Str::lower(
                                Str::random(8)
                            ),

                        'phone' => trim(
                            $validated['phone']
                        ),

                        'email' => $email,

                        'is_active' => true,
                    ]);

                    return User::create([
                        'restaurant_id' => $restaurant->id,

                        'owner_name' => trim(
                            $validated['owner_name']
                        ),

                        'email' => $email,

                        'phone' => trim(
                            $validated['phone']
                        ),

                        'password' => Hash::make(
                            $validated['password']
                        ),

                        'role' => 'owner',

                        'is_active' => true,

                        'email_verified_at' => null,
                    ]);
                }
            );
        } catch (Throwable $exception) {
            Log::error(
                'Owner registration failed.',
                [
                    'email' => $email,
                    'exception' => $exception,
                ]
            );

            return response()->json([
                'success' => false,
                'message' =>
                    'Unable to create the account. Please try again.',
            ], 500);
        }

        try {
            $otpService->sendOtp($user);
        } catch (Throwable $exception) {
            Log::error(
                'Registration OTP email failed.',
                [
                    'user_id' => $user->id,
                    'exception' => $exception,
                ]
            );

            return response()->json([
                'success' => false,
                'message' =>
                    'Account created, but the verification email could not be sent. Please request a new code.',
                'code' => 'VERIFICATION_EMAIL_FAILED',
                'data' => [
                    'email' => $user->email,
                    'verification_required' => true,
                ],
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' =>
                'Account created. Enter the verification code sent to your email.',
            'data' => [
                'email' => $user->email,
                'verification_required' => true,
                'expires_in_minutes' =>
                    EmailOtp::EXPIRY_MINUTES,
                'resend_after_seconds' =>
                    EmailOtp::RESEND_COOLDOWN_SECONDS,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($request->login);

        /*
        |--------------------------------------------------------------------------
        | OWNER + STAFF UNIFIED LOGIN
        |--------------------------------------------------------------------------
        | Owner: email
        | Staff: username / Staff ID / email
        | Super Admin is intentionally excluded.
        */

        $user = User::whereIn('role', ['owner', 'staff'])
            ->where(function ($query) use ($login) {
                $query
                    ->where('email', $login)
                    ->orWhere('username', $login);
            })
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login credentials.',
            ], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login credentials.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive.',
            ], 403);
        }


        /*
|--------------------------------------------------------------------------
| Owner email verification
|--------------------------------------------------------------------------
|
| Only owner accounts require registration email verification.
| Staff accounts continue using their existing login flow.
|
*/

if (
    $user->role === 'owner' &&
    $user->email_verified_at === null
) {
    return response()->json([
        'success' => false,

        'message' =>
            'Please verify your email address before logging in.',

        'code' =>
            'EMAIL_NOT_VERIFIED',

        'data' => [
            'email' =>
                $user->email,

            'verification_required' =>
                true,
        ],
    ], 403);
}


        $user->tokens()->delete();

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $token,
            'role' => $user->role,
            'user' => $user,
        ]);
    }

    public function superAdminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
            ->where('role', 'super_admin')
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Super Admin not found.',
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid Credentials',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is inactive',
            ], 403);
        }

        $user->tokens()->delete();

        $token = $user
            ->createToken('super_admin')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'role' => $user->role,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'message' => 'Logout Successful',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(
            $request->user()
        );
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'owner_name' => 'required|string|max:255',
            'email' =>
                'required|email|max:255|unique:users,email,'
                . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if (!Hash::check(
            $request->current_password,
            $user->password
        )) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make(
                $request->new_password
            ),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
        ]);
    }
}
