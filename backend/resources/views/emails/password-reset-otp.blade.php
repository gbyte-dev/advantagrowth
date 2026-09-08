<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

   (OP) <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Reset Your Password</title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f4f7fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    "
>
    <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="background-color: #f4f7fb;"
    >
        <tr>
            <td
                align="center"
                style="padding: 40px 16px;"
            >
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
                    "
                >
                    <tr>
                        <td
                            style="
                                padding: 28px 32px;
                                background: #111827;
                                color: #ffffff;
                                text-align: center;
                            "
                        >
                            <h1
                                style="
                                    margin: 0;
                                   lv: 0;
                                    font-size: 24px;
                                "
                            >
                                Advanta Growth
                            </h1>

                            <p
                                style="
                                    margin: 8px 0 0;
                                    color: #d1d5db;
                                    font-size: 14px;
                                "
                            >
                                Secure Account Recovery
                            </p>
                        </>
                    </tr>

                    <tr>
                        <td style="padding: 32px;">
                            <p
                                style="
                                    margin: 0 0 16px;
                                    font-size: 16px;
                                "
                            >
                                Hello {{ $accountName }},
                            </p>

                            <p
                                style="
                                    margin: 0 0 24px;
                                    color: #4b5563;
                                    line-height: 1.6;
                                "
                            >
                                Use the verification code below to reset
                                your Advanta Growth account password.
                            </p>

                            <div
                                style="
                                    padding: 20px;
                                    margin: 0 0 24px;
                                    background-color: #f3f4f6;
                                    border-radius: 12px;
                                    text-align: center;
                                "
                            >
                                <p
                                    style="
                                        margin: 0 0 8px;
                                        color: #6b7280;
                                        font-size: 12px;
                                        font-weight: bold;
                                        letter-spacing: 1px;
                                        text-transform: uppercase;
                                    "
                                >
                                    Password Reset Code
                                </p>

                                <p
                                    style="
                                        margin: 0;
                                        color: #111827;
                                        font-size: 34px;
                                        font-weight: bold;
                                        letter-spacing: 8px;
                                    "
                                >
                                    {{ $otp }}
                                </p>
                            </div>

                            <p
                                style="
                                    margin: 0 0 12px;
                                    color: #4b5563;
                                    line-height: 1.6;
                                "
                            >
                                This code expires in
                                <strong>
                                    {{ $expiresInMinutes }} minutes
                                </strong>.
                            </p>

                            <p
                                style="
                                    margin: 0;
                                    color: #6b7280;
                                    font-size: 13px;
                                    line-height: 1.6;
                                "
                            >
                                If you did not request a password reset,
                                you can safely ignore this email. Never
                                share this code with anyone.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 20px 32px;
                                background-color: #f9fafb;
                                color: #9ca3af;
                                text-align: center;
                                font-size: 12px;
                            "
                        >
                            © {{ date('Y') }} Advanta Growth
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>