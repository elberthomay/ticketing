import {
  AbstractListener,
  Subjects,
  OrderCancelledEvent,
  OrderEventData,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";

export class OrderCancelledListener extends AbstractListener<OrderCancelledEvent> {
  readonly subject = Subjects.orderCancelled;
  queueGroupName: string = "tickets-service";
  onMessage = (event: OrderCancelledEvent["data"], msg: Message) => {};
}
