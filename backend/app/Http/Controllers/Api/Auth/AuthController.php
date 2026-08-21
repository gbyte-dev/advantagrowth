<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'restaurant_name' => 'required|string|max:255',
            'owner_name'      => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email|unique:restaurants,email',
            'phone'           => 'required|string|max:20',
            'password'        => 'required|min:6',
        ]);

        DB::beginTransaction();

        try {

            $restaurant = Restaurant::create([
                'name'      => $request->restaurant_name,
                'slug'      => Str::slug($request->restaurant_name) . '-' . time(),
                'phone'     => $request->phone,
                'email'     => $request->email,
                'is_active' => true,
            ]);

            $user = User::create([
                'restaurant_id' => $restaurant->id,
                'owner_name'    => $request->owner_name,
                'email'         => $request->email,
                'phone'         => $request->phone,
                'password'      => Hash::make($request->password),
                'role'          => 'owner',
                'is_active'     => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Registration Successful',
                'user'    => $user,
            ], 201);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
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
    | Owner:
    |   - Email
    |
    | Staff:
    |   - Username / Staff ID
    |   - Email
    |
    | Super Admin is intentionally excluded.
    */

    $user = User::whereIn('role', ['owner', 'staff'])
        ->where(function ($query) use ($login) {
            $query->where('email', $login)
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
    | Remove old tokens
    |--------------------------------------------------------------------------
    */

    $user->tokens()->delete();

    /*
    |--------------------------------------------------------------------------
    | Create new token
    |--------------------------------------------------------------------------
    */

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Login successful.',
        'token'   => $token,
        'role'    => $user->role,
        'user'    => $user,
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
            'message' => 'Super Admin not found.'
        ], 404);
    }

    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Invalid Credentials'
        ], 401);
    }

    if (!$user->is_active) {
        return response()->json([
            'message' => 'Account is inactive'
        ], 403);
    }

    $user->tokens()->delete();

    $token = $user->createToken('super_admin')->plainTextToken;

    return response()->json([
        'success' => true,
        'token'   => $token,
        'role'    => $user->role,
        'user'    => $user,
    ]);
}

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout Successful'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
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

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
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

    /*
    |--------------------------------------------------------------------------
    | Revoke all login tokens
    |--------------------------------------------------------------------------
    */

    $user->tokens()->delete();

    /*
    |--------------------------------------------------------------------------
    | Delete user account
    |--------------------------------------------------------------------------
    */

    $user->delete();

    return response()->json([
        'success' => true,
        'message' => 'Account deleted successfully.',
    ]);
}
}