import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import Achievement from './models/achievement';
import mongoose from 'mongoose';
import { getUri } from './utils/getDatabaseUri';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

const port = Number(process.env.SERVER_PORT) || 1234;
addTestShit();

async function addTestShit() {
  try {
    const uri = getUri();
    await mongoose.connect(uri);
    console.log({ uri });
    const testAchievement = new Achievement({
      category: 'kategoria1',
      project: 'projekt1',
      stage: 1
    });
    const x = await testAchievement.save();
    console.log({ testAchievement, x });
    // console.log('zpaisano ');
  } catch (error) {
    console.log({ error });
  }
}

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
