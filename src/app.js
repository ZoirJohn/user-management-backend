import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
configDotenv();
import { errorHandler } from "./middleware/errorHandler.js";
import { router as authRoutes } from "./routes/auth.routes.js";
import { router as usersRoutes } from "./routes/users.routes.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "https://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
	app.use((req, res, next) => {
		console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
		next();
	});
}
app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});
app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: `Route ${req.method} ${req.path} not found`,
	});
});

app.use(errorHandler);

export { app };
