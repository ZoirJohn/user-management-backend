import { pool as db } from "../config/database.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const result = await db.query(`
            SELECT 
                id,
                name,
                email,
                status,
                last_login_time,
                registration_time,
                created_at
            FROM users
            ORDER BY last_login_time DESC NULLS LAST
        `);

		res.json({
			success: true,
			data: {
				users: result.rows,
				count: result.rows.length,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const blockUsers = async (req, res, next) => {
	try {
		const { userIds } = req.body;

		if (!Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Please provide an array of user IDs to block",
			});
		}

		const result = await db.query(
			`UPDATE users 
             SET status = 'blocked' 
             WHERE id = ANY($1::int[])
             RETURNING id, name, email, status`,
			[userIds],
		);

		res.json({
			success: true,
			message: `${result.rows.length} user(s) blocked successfully`,
			data: {
				blockedUsers: result.rows,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const unblockUsers = async (req, res, next) => {
	try {
		const { userIds } = req.body;

		if (!Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Please provide an array of user IDs to unblock",
			});
		}

		const result = await db.query(
			`UPDATE users 
             SET status = 'active' 
             WHERE id = ANY($1::int[]) AND status = 'blocked'
             RETURNING id, name, email, status`,
			[userIds],
		);

		res.json({
			success: true,
			message: `${result.rows.length} user(s) unblocked successfully`,
			data: {
				unblockedUsers: result.rows,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const deleteUsers = async (req, res, next) => {
	try {
		const { userIds } = req.body;
		if (!Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Please provide an array of user IDs to delete",
			});
		}
		const result = await db.query(
			`DELETE FROM users 
             WHERE id = ANY($1::int[])
             RETURNING id, name, email`,
			[userIds],
		);
		const deletedSelf = result.rows.some((user) => user.id === req.user.id);
		res.json({
			success: true,
			message: `${result.rows.length} user(s) deleted successfully`,
			data: {
				deletedUsers: result.rows,
				deletedSelf: deletedSelf,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const deleteUnverifiedUsers = async (req, res, next) => {
	try {
		const result = await db.query(
			`DELETE FROM users 
             WHERE status = 'unverified'
             RETURNING id, name, email`,
		);

		res.json({
			success: true,
			message: `${result.rows.length} unverified user(s) deleted successfully`,
			data: {
				deletedCount: result.rows.length,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getUserStats = async (req, res, next) => {
	try {
		const result = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE status = 'active') as active_users,
                COUNT(*) FILTER (WHERE status = 'unverified') as unverified_users,
                COUNT(*) FILTER (WHERE status = 'blocked') as blocked_users,
                COUNT(*) FILTER (WHERE last_login_time > NOW() - INTERVAL '24 hours') as active_last_24h
            FROM users
        `);

		res.json({
			success: true,
			data: {
				stats: result.rows[0],
			},
		});
	} catch (error) {
		next(error);
	}
};
