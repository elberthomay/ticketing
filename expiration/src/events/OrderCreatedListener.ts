import {
  AbstractListener,
  OrderCreatedEvent,
  OrderEventData,
  Subjects,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import queueObject from "../bullmq/queueObject";

export class OrderCreatedListener extends AbstractListener<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  queueGroupName: string = "expiration-service";
  onMessage: (event: OrderEventData, msg: Message) => void = async (
    event: OrderEventData,
    msg: Message
  ) => {
    const delay = event.expiresAt - Date.now();
    console.log(event.expiresAt);
    await queueObject.add("newOrder", event, { delay });
    console.log("orderCreatedEvent received:", event);
    msg.ack();
  };
}
