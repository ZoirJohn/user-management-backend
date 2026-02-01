import { configDotenv } from "dotenv";
import { Pool } from "pg";

configDotenv();

export const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,

	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
	if (err) {
		console.error("❌ Error connecting to PostgreSQL:", err.stack);
		console.error("\nPlease check:");
		console.error("1. PostgreSQL is running");
		console.error('2. Database "user_management" exists');
		console.error("3. Credentials in .env are correct\n");
		process.exit(1);
	}

	console.log("✅ PostgreSQL connected successfully");
	console.log(`   Database: ${process.env.DB_NAME}`);
	console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

	release();
});

process.on("SIGINT", async () => {
	console.log("\n⏳ Closing database connections...");
	await pool.end();
	console.log("✅ Database connections closed");
	process.exit(0);
});
pool.on("error", (err) => {
	console.error("❌ Unexpected database error:", err);
});
