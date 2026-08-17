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
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid Credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is inactive.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login Successful',
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
}