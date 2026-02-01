import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				success: false,
				message: "Authentication required. Please login.",
				redirect: "/login",
			});
		}

		const token = authHeader.split(" ")[1];

		const decoded = verifyToken(token);

		if (!decoded) {
			return res.status(401).json({
				success: false,
				message: "Invalid or expired session. Please login again.",
				redirect: "/login",
			});
		}

		const result = await db.query("SELECT id, email, name, status FROM users WHERE id = $1", [decoded.userId]);

		if (result.rows.length === 0) {
			return res.status(401).json({
				success: false,
				message: "User account not found. Please login again.",
				redirect: "/login",
			});
		}

		const user = result.rows[0];

		if (user.status === "blocked") {
			return res.status(403).json({
				success: false,
				message: "Your account has been blocked. Please contact support.",
				redirect: "/login",
			});
		}

		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			status: user.status,
		};

		next();
	} catch (error) {
		console.error("Authentication error:", error);
		return res.status(500).json({
			success: false,
			message: "Authentication failed. Please try again.",
		});
	}
};