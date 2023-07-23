import {
  AbstractListener,
  OrderConfirmedEvent,
  OrderCreatedEvent,
  OrderEventData,
  OrderStatus,
  QueueGroups,
  Subjects,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import queueObject from "../bullmq/queueObject";
import _ from "lodash";

export class OrderConfirmedListener extends AbstractListener<OrderConfirmedEvent> {
  readonly subject = Subjects.orderConfirmed;
  queueGroupName = QueueGroups.expirationGroup;
  onMessage: (event: OrderConfirmedEvent["data"], msg: Message) => void =
    async (event: OrderConfirmedEvent["data"], msg: Message) => {
      const delay = event.expiresAt - Date.now();
      await queueObject.add(
        "newOrder",
        { id: event.id, status: OrderStatus.awaitingPayment },
        {
          delay,
        }
      );
      msg.ack();
    };
}
