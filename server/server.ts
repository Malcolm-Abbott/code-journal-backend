/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());

app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `
    select *
      from "entries"
      order by "entryId";
    `;
    const result = await db.query(sql);
    const entries = result.rows;
    if (!entries) throw new ClientError(404, `Entries not found.`);
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'entryId must be a number');
    const sql = `
      select *
        from "entries"
        where "entryId" = $1;
    `;
    const params = [entryId as string];
    const result = await db.query(sql, params);
    const [entry] = result.rows;
    if (!entry) throw new ClientError(404, `Entry ${entryId} not found.`);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entries', async (req, res, next) => {
  try {
    const { entryId, title, notes, photoUrl } = req.body;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'entryId must be a number');
    if (!entryId || !title || !notes || !photoUrl)
      throw new ClientError(400, 'Entry requires all inputs');
    const sql = `
      insert into "entries" ("entryId", "title", "notes", "photoUrl")
        values($1, $2, $3, $4)
        returning *;
    `;
    const params = [
      entryId as string,
      title as string,
      notes as string,
      photoUrl as string,
    ];
    const result = await db.query(sql, params);
    const [entry] = result.rows;
    if (!entry) throw new ClientError(404, `Entry not found.`);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
