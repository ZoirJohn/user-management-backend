import "dotenv/config";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	function listRoutes() {
		const routes = [];
		app._router.stack.forEach((middleware) => {
			if (middleware.route) {
				const methods = Object.keys(middleware.route.methods).join(", ").toUpperCase();
				routes.push(`${methods} ${middleware.route.path}`);
			} else if (middleware.name === "router") {
				middleware.handle.stack.forEach((handler) => {
					if (handler.route) {
						const methods = Object.keys(handler.route.methods).join(", ").toUpperCase();
						routes.push(`${methods} ${handler.route.path}`);
					}
				});
			}
		});
		return routes;
	}
	console.log(listRoutes());
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
