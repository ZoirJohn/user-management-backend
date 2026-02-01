import { sign, verify } from "jsonwebtoken";

export const generateToken = (payload) => {
	return sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "24h" });
};

export const verifyToken = (token) => {
	try {
		verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
};
