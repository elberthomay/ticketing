import {
  AbstractListener,
  OrderCreatedEvent,
  OrderEventData,
  OrderStatus,
  QueueGroups,
  Subjects,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import queueObject from "../bullmq/queueObject";
import _ from "lodash";

export class OrderCreatedListener extends AbstractListener<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  queueGroupName = QueueGroups.expirationGroup;
  onMessage: (event: OrderEventData, msg: Message) => void = async (
    event: OrderEventData,
    msg: Message
  ) => {
    const delay = event.expiresAt - Date.now();
    await queueObject.add(
      "newOrder",
      {
        id: event.id,
        status: event.status,
      },
      {
        delay,
      }
    );
    msg.ack();
  };
}
