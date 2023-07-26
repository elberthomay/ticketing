import app from "../app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;
jest.mock("../events/natsClient.ts");
jest.unmock("../stripe.ts"); //jest.mock("../stripe.ts");
beforeAll(async () => {
  process.env.JWT_KEY = "secret";
  process.env.NODE_ENV = "test";
  //   mongo = new MongoMemoryServer();
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (mongo) await mongo.stop();
  await mongoose.connection.close();
});
