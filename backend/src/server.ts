import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { MongoClient, ServerApiVersion, MongoClientOptions } from 'mongodb';

//dotenv nie pobiera sie poprawnie. do naprawy potem
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

const port = Number(process.env.SERVER_PORT) || 1234;
const mongoUrl =
  process.env.MONGO_DB_URI?.replace(
    '<MONGO_DB_PASSWORD>',
    process.env.MONGO_DB_PASSWORD || ''
  ) || '';

const client = new MongoClient(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
} as MongoClientOptions);

client.connect((err) => {
  if (err) {
    console.error({ ok: false, message: err.message });
  }
  const collection = client.db('katelier').collection('steps');
  if (!collection) {
    console.warn('no collection', { collection, mongoUrl, port });
  }
  client.close();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
