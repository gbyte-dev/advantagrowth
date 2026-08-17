<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|min:6',
        ]);

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Customer Registered Successfully',
            'customer' => $customer,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            return response()->json([
                'message' => 'Invalid Credentials'
            ], 401);
        }

        if (!$customer->is_active) {
            return response()->json([
                'message' => 'Account is inactive.'
            ], 403);
        }

        $token = $customer->createToken('customer_token')->plainTextToken;

        return response()->json([
            'message' => 'Login Successful',
            'token' => $token,
            'customer' => $customer,
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