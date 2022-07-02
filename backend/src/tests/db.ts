import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

type Helper = () => Promise<void>;

export const connectDB: Helper = async () => {
  const uri = await mongod.getUri();
  const mongooseOptions: mongoose.ConnectOptions = { maxPoolSize: 10 };
  await mongoose.connect(uri, mongooseOptions);
};

export const closeDB: Helper = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export const clearDB: Helper = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({}); //?? in the original tur the legacy mongo shell documentation
  }
};
