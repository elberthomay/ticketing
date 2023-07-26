import {
  AbstractListener,
  OrderCreatedEvent,
  OrderEventData,
  Subjects,
  QueueGroups,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Order from "../models/Order";
export class OrderCreatedListener extends AbstractListener<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  queueGroupName = QueueGroups.paymentGroup;
  onMessage = async (event: OrderEventData, msg: Message) => {
    try {
      const newOrder = await Order.createOrder(event);
      msg.ack();
    } catch (err) {
      console.log(err);
    }
  };
}
