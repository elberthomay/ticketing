import { Queue } from "bullmq";
import { OrderEventData } from "@elytickets/common";
const queueObject = new Queue<OrderEventData>("expiration-queue", {
  connection: {
    host: process.env.REDIS_HOST_NAME,
    port: 6379,
  },
});

export default queueObject;
