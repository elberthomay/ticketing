import {
  AbstractListener,
  OrderConfirmedEvent,
  OrderEventData,
  Subjects,
  QueueGroups,
  DocumentNotFoundError,
  OrderStatus,
  VersionError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Order from "../models/Order";
export class OrderConfirmedListener extends AbstractListener<OrderConfirmedEvent> {
  readonly subject = Subjects.orderConfirmed;
  queueGroupName = QueueGroups.paymentGroup;
  onMessage = async (event: OrderConfirmedEvent["data"], msg: Message) => {
    try {
      const order = await Order.findDocumentById(event.id);
      if (order?.version !== event.version - 1) throw new VersionError();
      order?.set({
        status: OrderStatus.awaitingPayment,
      });
      await order?.save();
      msg.ack();
    } catch (err) {
      console.log(err);
    }
  };
}
