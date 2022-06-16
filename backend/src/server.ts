import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { getUri } from './utils/getDatabaseUri';
import { useAllRoutesBy } from './routes/combinedRoutes';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

const port = Number(process.env.SERVER_PORT) || 1234;
addTestShit();

async function addTestShit() {
  try {
    const uri = getUri();
    await mongoose.connect(uri);
  } catch (error) {
    console.log({ error });
  }
}
useAllRoutesBy(app);

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
