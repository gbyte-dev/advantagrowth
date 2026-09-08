<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Verify Your Email</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f5f3ff;
    font-family: Arial, Helvetica, sans-serif;
    color: #1e293b;
">
    <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="padding: 32px 16px;"
    >
        <tr>
            <td align="center">
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="
                        max-width: 560px;
                        background-color: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        overflow: hidden;
                    "
                >
                    <tr>
                        <td style="
                            padding: 24px 32px;
                            background-color: #111827;
                            color: #ffffff;
                        ">
                            <div style="
                                font-size: 20px;
                                font-weight: 700;
                            ">
                                Advanta Growth
                            </div>

                            <div style="
                                margin-top: 4px;
                                font-size: 13px;
                                color: #cbd5e1;
                            ">
                                Restaurant Management Platform
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="
                                margin: 0;
                                color: #0f172a;
                                font-size: 24px;
                                line-height: 1.3;
                            ">
                                Verify your email address
                            </h1>

                            <p style="
                                margin: 20px 0 0;
                                font-size: 15px;
                                line-height: 1.7;
                            ">
                                Hello {{ $accountName }},
                            </p>

                            <p style="
                                margin: 12px 0 0;
                                font-size: 15px;
                                line-height: 1.7;
                            ">
                                Use the verification code below to
                                activate your Advanta Growth account.
                            </p>

                            <div style="
                                margin: 28px 0;
                                padding: 20px;
                                background-color: #f5f3ff;
                                border: 1px solid #ddd6fe;
                                border-radius: 12px;
                                text-align: center;
                            ">
                                <div style="
                                    color: #6d28d9;
                                    font-size: 12px;
                                    font-weight: 700;
                                    letter-spacing: 1px;
                                    text-transform: uppercase;
                                ">
                                    Verification code
                                </div>

                                <div style="
                                    margin-top: 10px;
                                    color: #4c1d95;
                                    font-size: 34px;
                                    font-weight: 800;
                                    letter-spacing: 8px;
                                ">
                                    {{ $otp }}
                                </div>
                            </div>

                            <p style="
                                margin: 0;
                                color: #475569;
                                font-size: 14px;
                                line-height: 1.7;
                            ">
                                This code expires in
                                <strong>
                                    {{ $expiresInMinutes }} minutes
                                </strong>.
                            </p>

                            <p style="
                                margin: 16px 0 0;
                                color: #475569;
                                font-size: 14px;
                                line-height: 1.7;
                            ">
                                If you did not create this account,
                                you can safely ignore this email.
                                Never share this code with anyone.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 18px 32px;
                            background-color: #f8fafc;
                            border-top: 1px solid #e2e8f0;
                            color: #64748b;
                            font-size: 12px;
                            line-height: 1.6;
                            text-align: center;
                        ">
                            This is an automated security email from
                            Advanta Growth.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>