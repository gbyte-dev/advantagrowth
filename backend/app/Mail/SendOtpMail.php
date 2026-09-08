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
        public readonly string $purpose =
            EmailOtp::PURPOSE_EMAIL_VERIFICATION
    ) {
    }

    public function envelope(): Envelope
    {
        $subject =
            $this->purpose ===
            EmailOtp::PURPOSE_PASSWORD_RESET
                ? 'Your Advanta Growth password reset code'
                : 'Verify your Advanta Growth email';

        return new Envelope(
            subject:
                $subject
        );
    }

    public function content(): Content
    {
        $view =
            $this->purpose ===
            EmailOtp::PURPOSE_PASSWORD_RESET
                ? 'emails.password-reset-otp'
                : 'emails.account-verification-otp';

        return new Content(
            view:
                $view,

            with: [
                'otp' =>
                    $this->otp,

                'accountName' =>
                    $this->accountName,

                'expiresInMinutes' =>
                    $this->expiresInMinutes,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}