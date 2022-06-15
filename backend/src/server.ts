import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

//dotenv nie pobiera sie poprawnie. do naprawy potem
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

const port = process.env.SERVER_PORT || 1234;
console.log(process.env);

app.get('/', (req: Request, res: Response) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
