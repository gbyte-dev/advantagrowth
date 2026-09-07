<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Password Reset Code</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f5f3ff;
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
                        background: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        overflow: hidden;
                    "
                >
                    <tr>
                        <td style="
                            padding: 24px 32px;
                            background: #111827;
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
                                font-size: 24px;
                                line-height: 1.3;
                                color: #0f172a;
                            ">
                                {{ $heading }}
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
                                {{ $instruction }}
                            </p>

                            <div style="
                                margin: 28px 0;
                                padding: 20px;
                                border-radius: 12px;
                                background: #f5f3ff;
                                border: 1px solid #ddd6fe;
                                text-align: center;
                            ">
                                <div style="
                                    font-size: 12px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                    color: #6d28d9;
                                ">
                                    Verification code
                                </div>

                                <div style="
                                    margin-top: 10px;
                                    font-size: 34px;
                                    font-weight: 800;
                                    letter-spacing: 8px;
                                    color: #4c1d95;
                                ">
                                    {{ $otp }}
                                </div>
                            </div>

                            <p style="
                                margin: 0;
                                font-size: 14px;
                                line-height: 1.7;
                                color: #475569;
                            ">
                                This code expires in
                                <strong>
                                    {{ $expiresInMinutes }} minutes
                                </strong>.
                            </p>

                            <p style="
                                margin: 16px 0 0;
                                font-size: 14px;
                                line-height: 1.7;
                                color: #475569;
                            ">
                                {{ $ignoreMessage }}
                                Never share this code with anyone.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="
                            padding: 18px 32px;
                            background: #f8fafc;
                            border-top: 1px solid #e2e8f0;
                            font-size: 12px;
                            line-height: 1.6;
                            color: #64748b;
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