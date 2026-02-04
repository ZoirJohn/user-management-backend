import "dotenv/config";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);

	console.log("\nAvailable Endpoints:");
	console.log("  GET  /api/health");
	console.log("  POST /api/auth/register");
	console.log("  POST /api/auth/login");
	console.log("  GET  /api/auth/verify-email?token=xxx");
	console.log("  GET  /api/auth/me");
	console.log("  GET  /api/users");
	console.log("  POST /api/users/block");
	console.log("  POST /api/users/unblock");
	console.log("  DELETE /api/users");
	console.log("  DELETE /api/users/unverified");
	console.log("================================================\n");
});

process.on("SIGTERM", () => {
	console.log("\n⏳ SIGTERM received. Closing server gracefully...");
	server.close(() => {
		console.log("✅ Server closed");
		process.exit(0);
	});
});

process.on("SIGINT", () => {
	console.log("\n⏳ SIGINT received. Closing server gracefully...");
	server.close(() => {
		console.log("✅ Server closed");
		process.exit(0);
	});
});

process.on("uncaughtException", (error) => {
	console.error("❌ Uncaught Exception:", error);
	process.exit(1);
});

process.on("unhandledRejection", (error) => {
	console.error("❌ Unhandled Rejection:", error);
	process.exit(1);
});
