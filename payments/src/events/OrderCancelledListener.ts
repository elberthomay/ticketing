import {
  AbstractListener,
  OrderCancelledEvent,
  OrderEventData,
  Subjects,
  QueueGroups,
  DocumentNotFoundError,
  OrderStatus,
  VersionError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Order from "../models/Order";
export class OrderCancelledListener extends AbstractListener<OrderCancelledEvent> {
  readonly subject = Subjects.orderCancelled;
  queueGroupName = QueueGroups.paymentGroup;
  onMessage = async (event: OrderCancelledEvent["data"], msg: Message) => {
    try {
      const order = await Order.findDocumentById(event.id);
      if (order?.version !== event.version - 1) throw new VersionError();
      order?.set({
        status: OrderStatus.cancelled,
      });
      await order?.save();

      //handle refund if user has paid

      msg.ack();
    } catch (err) {
      console.log(err);
    }
  };
}
