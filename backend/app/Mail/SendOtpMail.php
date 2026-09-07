<?php

namespace App\Mail;

use App\Models\EmailOtp;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly string $accountName,
        public readonly int $expiresInMinutes,
        public readonly string $purpose
    ) {
    }

    public function envelope(): Envelope
    {
        $subject =
            $this->purpose ===
            EmailOtp::PURPOSE_EMAIL_VERIFICATION
                ? 'Verify your Advanta Growth email'
                : 'Your Advanta Growth password reset code';

        return new Envelope(
            subject:
                $subject
        );
    }

    public function content(): Content
    {
        $isEmailVerification =
            $this->purpose ===
            EmailOtp::PURPOSE_EMAIL_VERIFICATION;

        return new Content(
            view:
                'emails.password-reset-otp',

            with: [
                'otp' =>
                    $this->otp,

                'accountName' =>
                    $this->accountName,

                'expiresInMinutes' =>
                    $this->expiresInMinutes,

                'heading' =>
                    $isEmailVerification
                        ? 'Verify your email address'
                        : 'Reset your password',

                'instruction' =>
                    $isEmailVerification
                        ? 'Use the verification code below to activate your Advanta Growth account.'
                        : 'Use the verification code below to continue resetting your Advanta Growth password.',

                'ignoreMessage' =>
                    $isEmailVerification
                        ? 'If you did not create this account, you can safely ignore this email.'
                        : 'If you did not request a password reset, you can safely ignore this email.',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}