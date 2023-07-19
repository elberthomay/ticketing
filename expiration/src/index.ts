import { Queue, Worker } from "bullmq";
import { OrderCreatedListener } from "./events/OrderCreatedListener";
import natsClient from "./events/natsClient";
import { OrderExpiredPublisher } from "./events/OrderExpiredPublisher";
import { OrderEventData } from "@elytickets/common";
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
  const orderExpiredPublisher = new OrderExpiredPublisher(natsClient.client);
  orderCreatedListener.listen();
  const worker = new Worker<OrderEventData>(
    "expiration-queue",
    async (job) => {
      console.log("orderExpired Event published:", job.data);
      await orderExpiredPublisher.publish(job.data);
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
