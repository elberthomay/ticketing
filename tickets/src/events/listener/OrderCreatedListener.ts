import {
  AbstractListener,
  Subjects,
  OrderCreatedEvent,
  OrderEventData,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";

export class OrderCreatedListener extends AbstractListener<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  queueGroupName: string = "tickets-service";
  onMessage = (event: OrderEventData, msg: Message) => {};
}
