import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validation.js";
import { authenticate } from "../middleware/auth.js";
import { getAllUsers, getUserStats, blockUsers, unblockUsers, deleteUsers, deleteUnverifiedUsers } from "../controllers/users.controller.js";
const router = express.Router();

const userIdsValidation = [
	body("userIds").isArray({ min: 1 }).withMessage("userIds must be a non-empty array"),
	//
	body("userIds.*").isInt({ min: 1 }).withMessage("Each user ID must be a positive integer"),
];

router.get("/", authenticate, getAllUsers);

router.get("/stats", authenticate, getUserStats);

router.post("/block", authenticate, userIdsValidation, validate, blockUsers);

router.post("/unblock", authenticate, userIdsValidation, validate, unblockUsers);

router.delete("/", authenticate, userIdsValidation, validate, deleteUsers);

router.delete("/unverified", authenticate, deleteUnverifiedUsers);

export { router };
