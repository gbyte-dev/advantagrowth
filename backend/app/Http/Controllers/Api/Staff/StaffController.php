<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    /**
     * List all staff of logged-in owner's restaurant
     */
    public function index(Request $request)
    {
        $staff = User::where('restaurant_id', $request->user()->restaurant_id)
            ->where('role', 'staff')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($staff);
    }

    /**
     * Create Staff
     */
    public function store(Request $request)
{
    $request->validate([
        'owner_name' => 'required|string|max:255',
        'email' => 'nullable|email|unique:users,email',
        'phone' => 'required|string|max:20',
        'username' => 'required|string|max:50|unique:users,username',
        'password' => 'required|min:6',
        'staff_role' => 'required|string',
        'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    $profileImage = null;

    if ($request->hasFile('profile_image')) {
        $profileImage = $request->file('profile_image')
            ->store('staff-profiles', 'public');
    }

    $staff = User::create([
        'restaurant_id' => $request->user()->restaurant_id,
        'owner_name' => $request->owner_name,
        'email' => $request->email,
        'phone' => $request->phone,
        'username' => $request->username,
        'password' => Hash::make($request->password),
        'role' => 'staff',
        'staff_role' => $request->staff_role,
        'profile_image' => $profileImage,
        'is_active' => true,
    ]);

    return response()->json([
        'message' => 'Staff created successfully.',
        'staff' => $staff,
    ], 201);
}

    /**
     * Update Staff
     */
    public function update(Request $request, $id)
{
    $staff = User::where('restaurant_id', $request->user()->restaurant_id)
        ->where('role', 'staff')
        ->findOrFail($id);

    $request->validate([
        'owner_name' => 'required|string|max:255',
        'phone' => 'required|string|max:20',
        'username' => 'required|unique:users,username,' . $staff->id,
        'staff_role' => 'required|string',
        'profile_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    $data = [
        'owner_name' => $request->owner_name,
        'phone' => $request->phone,
        'username' => $request->username,
        'staff_role' => $request->staff_role,
    ];

    if ($request->hasFile('profile_image')) {
        $data['profile_image'] = $request->file('profile_image')
            ->store('staff-profiles', 'public');
    }

    $staff->update($data);

    return response()->json([
        'message' => 'Staff updated successfully.',
        'staff' => $staff,
    ]);
}

    /**
     * Delete Staff
     */
    public function destroy(Request $request, $id)
    {
        $staff = User::where('restaurant_id', $request->user()->restaurant_id)
            ->where('role', 'staff')
            ->findOrFail($id);

        $staff->tokens()->delete();
        $staff->delete();

        return response()->json([
            'message' => 'Staff deleted successfully.'
        ]);
    }

    /**
     * Enable / Disable Staff
     */
    public function toggleStatus(Request $request, $id)
    {
        $staff = User::where('restaurant_id', $request->user()->restaurant_id)
            ->where('role', 'staff')
            ->findOrFail($id);

        $staff->is_active = !$staff->is_active;
        $staff->save();

        return response()->json([
            'message' => 'Status updated.',
            'is_active' => $staff->is_active,
        ]);
    }

    /**
     * Reset Password
     */
    public function resetPassword(Request $request, $id)
    {
        $staff = User::where('restaurant_id', $request->user()->restaurant_id)
            ->where('role', 'staff')
            ->findOrFail($id);

        $request->validate([
            'password' => 'required|min:6',
        ]);

        $staff->password = Hash::make($request->password);
        $staff->save();

        return response()->json([
            'message' => 'Password updated successfully.'
        ]);
    }

    /**
     * Staff Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $staff = User::where('username', $request->username)
            ->where('role', 'staff')
            ->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Staff not found.'
            ], 404);
        }

        if (!Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid Credentials'
            ], 401);
        }

        if (!$staff->is_active) {
            return response()->json([
                'message' => 'Account is inactive.'
            ], 403);
        }

        $staff->tokens()->delete();

        $token = $staff->createToken('staff')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'role' => $staff->role,
            'user' => $staff,
        ]);
    }

    /**
     * Logged-in Staff Profile
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Staff Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful.'
        ]);
    }
}