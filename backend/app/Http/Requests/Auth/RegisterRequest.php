<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'owner_name' => 'required|string|max:255',

            'restaurant_name' => 'required|string|max:255',

            'restaurant_logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'email' => 'required|email|unique:users,email|unique:restaurants,email',

            'phone' => 'required|string|max:20',

            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'owner_name.required' => 'Owner name is required.',
            'restaurant_name.required' => 'Restaurant name is required.',
            'email.unique' => 'Email already exists.',
            'password.confirmed' => 'Passwords do not match.',
        ];
    }
}