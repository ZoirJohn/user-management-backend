export const errorHandler = (err, req, res, next) => {
	console.error("Error:", err);

	if (err.code === "23505") {
		return res.status(409).json({
			success: false,
			message: "Email already exists. Please use a different email.",
			error: "DUPLICATE_EMAIL",
		});
	}

	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal server error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};
