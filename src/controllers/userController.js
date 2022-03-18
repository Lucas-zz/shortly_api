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
		res.status(200).send(user);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

export async function getUserInfo(req, res) {
	const { id } = req.params;

	try {
		const { rows: user } = await db.query(`
			SELECT
				u.id,
				u.name,
				s.id,
				s.shortUrl,
				s.url,
				s."visitCount"
			FROM users u
				LEFT JOIN "shortUrls" s ON u.id=s."userId"
			WHERE u.id=$1
		`, [id]);

		if (user.length === 0) {
			return res.sendStatus(404);
		}

		const response = {
			id: user[0].id,
			name: user[0].name,
			visitCount: 0,
			shortenedUrls: []
		}

		const shortenedUrls = user.map(row => {
			response.visitCount += row.visitCount;
			return {
				id: row.id,
				shortUrl: row.shorturl,
				url: row.url,
				visitCount: row.visitCount
			}
		});

		response.shortenedUrls = shortenedUrls;

		res.send(response);
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
			ORDER BY "visitCount" DESC
			LIMIT 10
		`)

		res.send(users);

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}
