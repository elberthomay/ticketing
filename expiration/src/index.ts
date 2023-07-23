import { Queue, Worker } from "bullmq";
import { OrderCreatedListener } from "./events/OrderCreatedListener";
import natsClient from "./events/natsClient";
import { ExpirationCompletePublisher } from "./events/ExpirationCompletePublisher";
import { ExpirationCompleteEvent, OrderEventData } from "@elytickets/common";
import { OrderConfirmedListener } from "./events/OrderConfirmedListener";
const setup = async () => {
  if (
    !process.env.NATS_CLUSTER_ID ||
    !process.env.NATS_URL ||
    !process.env.NATS_CLIENT_ID
  ) {
    throw new Error("NATS environment variable is not set");
  }

  if (!process.env.REDIS_HOST_NAME)
    throw new Error("Redis server host is not defined");
  await natsClient.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
  );
  console.log("Nats connected");
  const orderCreatedListener = new OrderCreatedListener(natsClient.client);
  const orderConfirmedListener = new OrderConfirmedListener(natsClient.client);
  const expirationCompletePublisher = new ExpirationCompletePublisher(
    natsClient.client
  );
  orderCreatedListener.listen();
  orderConfirmedListener.listen();
  const worker = new Worker<ExpirationCompleteEvent["data"]>(
    "expiration-queue",
    async (job) => {
      await expirationCompletePublisher.publish(job.data);
    },
    {
      connection: {
        host: process.env.REDIS_HOST_NAME,
        port: 6379,
      },
    }
  );
};

setup();
