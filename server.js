import "dotenv/config";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {});

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
