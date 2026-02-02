import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	secure: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

export const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString("hex");
};

export const sendVerificationEmail = async (email, name, token) => {
	const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

	const mailOptions = {
		from: `"User Management System" <${process.env.EMAIL_FROM}>`,
		to: email,
		subject: "Verify Your Email Address",
		html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #007bff;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Welcome to User Management System!</h2>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${name}</strong>,</p>
                        
                        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
                            ${verificationUrl}
                        </p>
                        
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        
                        <p>If you didn't create this account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 User Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(`✅ Verification email sent to ${email}`);
		console.log(`   Message ID: ${info.messageId}`);
		return info;
	} catch (error) {
		console.error(`❌ Failed to send email to ${email}:`, error.message);
		throw error;
	}
};

export const verifyEmailConfig = async () => {
	try {
		await transporter.verify();
		console.log("✅ Email service configured and ready");
		return true;
	} catch (error) {
		console.error("❌ Email service configuration error:", error.message);
		console.error("   Emails will not be sent. Please check your .env configuration.");
		return false;
	}
};