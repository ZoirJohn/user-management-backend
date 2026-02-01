import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import { register, login, verifyEmail, getCurrentUser } from "../controllers/auth.controller.js";

const router = express.Router();

const registerValidation = [
	body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 255 }).withMessage("Name must be between 2 and 255 characters"),
	//
	body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
	//
	body("password").notEmpty().withMessage("Password is required").isLength({ min: 1 }).withMessage("Password is required"),
];

const loginValidation = [
	body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
	//
	body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/verify-email", verifyEmail);
router.get("/me", authenticate, getCurrentUser);

export { router };
