require('module-alias/register');
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { getUri } from 'src/utils/getDatabaseUri';
import { applyMiddleware, useAllRoutesBy } from 'src/routes/combinedRoutes';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

export const app = express();
app.use(express.json());

const port = Number(process.env.SERVER_PORT) || 1234;
connectToDb();

async function connectToDb() {
  try {
    const uri = getUri();
    await mongoose.connect(uri);
  } catch (error) {
    console.log({ error });
  }
}
applyMiddleware(app);
useAllRoutesBy(app);
app.listen(port, () => {
  console.log(`running on port ${port}`);
});
