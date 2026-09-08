<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    /**
     * This is a public registration verification
     * request, so authentication is not required.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' =>
                'Email address is required.',

            'email.email' =>
                'Please enter a valid email address.',

            'otp.required' =>
                'Verification code is required.',

            'otp.digits' =>
                'Verification code must contain exactly 6 digits.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (
            is_string(
                $this->email
            )
        ) {
            $this->merge([
                'email' =>
                    strtolower(
                        trim(
                            $this->email
                        )
                    ),
            ]);
        }

        if (
            is_string(
                $this->otp
            )
        ) {
            $this->merge([
                'otp' =>
                    trim(
                        $this->otp
                    ),
            ]);
        }
    }
}