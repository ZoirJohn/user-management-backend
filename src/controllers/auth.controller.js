// const bcrypt = require("bcrypt");
// const db = require("../config/database");
// const { generateToken } = require("../utils/jwt");
// const { sendVerificationEmail, generateVerificationToken } = require("../services/email.service");
import { bcrypt } from "bcrypt";
import { pool as db } from "./src/config/database.js";
import { generateToken } from "./src/utils/jwt.js";

export const register = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;

		const passwordHash = await bcrypt.hash(password, 10);

		const verificationToken = generateVerificationToken();

		const result = await db.query(
			`INSERT INTO users (name, email, password_hash, email_verification_token, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, status, registration_time`,
			[name, email.toLowerCase(), passwordHash, verificationToken, "unverified"],
		);

		const newUser = result.rows[0];

		sendVerificationEmail(email, name, verificationToken).catch((err) => console.error("Email sending failed:", err));

		res.status(201).json({
			success: true,
			message: "Registration successful! Please check your email to verify your account.",
			data: {
				user: {
					id: newUser.id,
					name: newUser.name,
					email: newUser.email,
					status: newUser.status,
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const result = await db.query("SELECT id, name, email, password_hash, status FROM users WHERE email = $1", [email.toLowerCase()]);

		if (result.rows.length === 0) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const user = result.rows[0];

		if (user.status === "blocked") {
			return res.status(403).json({
				success: false,
				message: "Your account has been blocked. Please contact support.",
			});
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);

		if (!isValidPassword) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		await db.query("UPDATE users SET last_login_time = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

		const token = generateToken({
			userId: user.id,
			email: user.email,
		});

		res.json({
			success: true,
			message: "Login successful",
			data: {
				token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					status: user.status,
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

export const verifyEmail = async (req, res, next) => {
	try {
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({
				success: false,
				message: "Verification token is required",
			});
		}

		const result = await db.query("SELECT id, status FROM users WHERE email_verification_token = $1", [token]);

		if (result.rows.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired verification token",
			});
		}

		const user = result.rows[0];

		if (user.status === "unverified") {
			await db.query(
				`UPDATE users 
                 SET status = 'active', email_verification_token = NULL 
                 WHERE id = $1`,
				[user.id],
			);

			res.json({
				success: true,
				message: "Email verified successfully! You can now login.",
			});
		} else if (user.status === "active") {
			res.json({
				success: true,
				message: "Email is already verified",
			});
		} else {
			res.json({
				success: false,
				message: "Your account has been blocked. Please contact support.",
			});
		}
	} catch (error) {
		next(error);
	}
};

export const getCurrentUser = async (req, res, next) => {
	try {
		const result = await db.query(
			`SELECT id, name, email, status, last_login_time, registration_time 
             FROM users WHERE id = $1`,
			[req.user.id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.json({
			success: true,
			data: {
				user: result.rows[0],
			},
		});
	} catch (error) {
		next(error);
	}
};

// module.exports = {
// 	register,
// 	login,
// 	verifyEmail,
// 	getCurrentUser,
// };