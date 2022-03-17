import { db } from "../database.js"
import { v4 as uuid } from "uuid";

export async function createUrl(req, res) {
    const { url } = req.body;

    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer", "");

    try {
        const users = await db.query(`
            SELECT "userId" FROM sessions WHERE token=$1
        `, [token]);

        if (users.rowCount === 0) {
            return res.sendStatus(404);
        }

        const userId = users.rows[0];
        const shortUrl = uuid().split("-")[0];

        await db.query(`
            INSERT INTO
                "shortUrls"("shortUrl", url, "userId")
            VALUES ($1, $2, $3)
        `, [shortUrl, url, userId]);

        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}