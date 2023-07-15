import app from "./app";
import mongoose from "mongoose";
import natsClient from "./events/natsClient";
import { TicketCreatedListener } from "./events/listener/ticketCreatedListener";
import { TicketUpdatedListener } from "./events/listener/TicketUpdatedListener";
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not defined in env");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in env");
  }
  if (
    !process.env.NATS_CLUSTER_ID ||
    !process.env.NATS_CLIENT_ID ||
    !process.env.NATS_URL
  ) {
    throw new Error("Nats env variable is not defined in env");
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected");
    await natsClient.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsClient.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });

    const ticketCreatedListener = new TicketCreatedListener(
      natsClient.client
    ).listen();
    const ticketUpdatedListener = new TicketUpdatedListener(
      natsClient.client
    ).listen();
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log("tickets listening to port 3000");
  });
};

start();

const exitAsync = async () => {
  await mongoose.connection.close();
  natsClient.close();
};

process.on("SIGINT", exitAsync);
process.on("SIGTERM", exitAsync);