const emailTemplate = (otp) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                padding: 20px;
                background-color: #001f3f; /* Dark Blue */
                color: #ffffff;
            }
            .content {
                background-color: #ffffff;
                color: #333333;
                padding: 20px;
                border-radius: 8px;
                max-width: 600px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #FFDC00;
                font-size: 28px;
            }
            .otp-code {
                font-size: 36px;
                color: #FFDC00; /* Yellow */
                text-align: center;
                margin: 20px 0;
            }
            .cta-button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #001f3f; /* Dark Blue */
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                text-align: center;
                width: 100%;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #999999;
                margin-top: 20px;
            }
            .footer p {
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="header">
                    <h1>Your OTP Code</h1>
                </div>
                <p>Hello, There!</p>
                <p>Thank you for using our service. Your One-Time Password (OTP) for email verification is:</p>
                <p>This code is valid for the next 10 minutes. Please do not share this code with anyone.</p>◘
                <div class="otp-code">${otp}</div>
                <div class="footer">
                    <p>If you did not request this, please ignore this email.</p>
                    <p>© 2024 JRMSU Cashier. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
};

module.exports = {
  emailTemplate,
};
