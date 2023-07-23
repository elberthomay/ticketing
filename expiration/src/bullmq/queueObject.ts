import { Queue } from "bullmq";
import { ExpirationCompleteEvent } from "@elytickets/common";
const queueObject = new Queue<ExpirationCompleteEvent["data"]>(
  "expiration-queue",
  {
    connection: {
      host: process.env.REDIS_HOST_NAME,
      port: 6379,
    },
  }
);

export default queueObject;
