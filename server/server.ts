/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';
import { nextTick } from 'process';

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

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'entryId must be a number');
    const { title, notes, photoUrl } = req.body;
    if (!title || !notes || !photoUrl)
      throw new ClientError(400, 'title, notes, photoUrl needed');
    const sql = `
    Update "entries"
    Set "title" = $1, "notes" = $2, "photoUrl" = $3
    Where "entryId" = $4
    Returning *;
    `;
    const params = [
      title as string,
      notes as string,
      photoUrl as string,
      entryId as string,
    ];
    const result = await db.query(sql, params);
    const [updatedEntry] = result.rows;
    if (!updatedEntry) throw new ClientError(404, 'not updated entry');
    res.status(200).json(updatedEntry);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'entryId not a number');
    const sql = `
    Delete from "entries"
    Where "entryId" = $1
    Returning *;
    `;
    const params = [entryId as string];
    const result = await db.query(sql, params);
    const [deletedEntry] = result.rows;
    if (!deletedEntry) throw new ClientError(404, 'entry not found');
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
