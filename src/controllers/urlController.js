import { db } from "../database.js"
import { v4 as uuid } from "uuid";

export async function createUrl(req, res) {
    const { url } = req.body;

    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "");

    try {
        const users = await db.query(`
            SELECT "userId" FROM sessions WHERE token=$1
        `, [token]);

        if (users.rowCount === 0) {
            return res.sendStatus(404);
        }

        const { userId } = users.rows[0];
        const shortUrl = uuid().split("-")[0];

        await db.query(`
            INSERT INTO
                "shortUrls" (shorturl, url, "userId")
            VALUES ($1, $2, $3)
        `, [shortUrl, url, userId]);

        res.status(201).send(shortUrl);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

export async function getUrl(req, res) {
    const { shortUrl } = req.params;

    try {
        const result = await db.query(`
            SELECT * FROM "shortUrls" WHERE shortUrl=$1
        `, [shortUrl]);

        if (result.rowCount === 0) {
            return res.sendStatus(404);
        }

        let count = result.rows[0].visitCount;

        count++;

        await db.query(`
            UPDATE "shortUrls"
                SET "visitCount"=$1
            WHERE shortUrl=$2
        `, [count, shortUrl]);

        delete result.rows[0].userId;
        delete result.rows[0].visitCount;

        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

export async function deleteUrl(req, res) {
    const { id } = req.params;

    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer ", "");

    try {

        const users = await db.query(`
        SELECT * FROM sessions WHERE token=$1
        `, [token]);

        if (users.rowCount === 0) {
            console.log(users.rows[0])
            return res.sendStatus(404);
        }

        const { userId } = users.rows[0];

        const url = await db.query(`
            SELECT id FROM "shortUrls" WHERE id=$1 AND "userId"=$2
        `, [id, userId]);

        if (url.rowCount === 0) {
            return res.sendStatus(401);
        }

        await db.query(`DELETE FROM "shortUrls" WHERE id=$1`, [id]);
        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}