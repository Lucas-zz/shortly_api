import bcrypt from 'bcrypt';
import { db } from '../database.js';

export async function createUser(req, res) {
	const user = req.body;

	try {
		const existingUsers = await db.query('SELECT * FROM users WHERE email=$1', [user.email])
		if (existingUsers.rowCount > 0) {
			return res.sendStatus(409);
		}

		const passwordHash = bcrypt.hashSync(user.password, 10);

		await db.query(`
      INSERT INTO
        users(name, email, password) 
      VALUES ($1, $2, $3)
    `, [user.name, user.email, passwordHash])

		res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

export async function getUser(req, res) {
	const { user } = res.locals;

	try {
		res.send(user);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

export async function getRanking(req, res) {
	try {
		const { rows: users } = await db.query(`
			SELECT
				users.id,
				users.name,
				COUNT(s."userId") AS "linksCount",
				COALESCE(SUM(s."visitCount"), 0) AS "visitCount"
			FROM users
				LEFT JOIN "shortUrls" s ON users.id=s."userId"
			GROUP BY users.id
			LIMIT 10
		`)

		res.send(users);

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}