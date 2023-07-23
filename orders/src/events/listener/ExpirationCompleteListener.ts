import { Message, Stan } from "node-nats-streaming";
import {
  Subjects,
  ExpirationCompleteEvent,
  QueueGroups,
} from "@elytickets/common";
import { AbstractListener } from "@elytickets/common";
import { Order } from "../../models/Order";
import { InvalidOrderMethodError } from "../../../errors/InvalidOrderMethodError";
import OrderCancelledPublisher from "../OrderCancelledPublisher";

export class ExpirationCompleteListener extends AbstractListener<ExpirationCompleteEvent> {
  readonly subject = Subjects.expirationComplete;
  queueGroupName = QueueGroups.orderGroup;
  onMessage = async (event: ExpirationCompleteEvent["data"], msg: Message) => {
    const { id, status } = event;
    const order = await Order.findDocumentById(id);
    if (!order) throw new Error("Invalid order id from OrderExpired event");
    try {
      if (order.status === status) {
        const updatedOrder = await Order.cancelOrderById(id);
        const orderCancelledPub = new OrderCancelledPublisher(this.client);
        await orderCancelledPub.publish({
          id: updatedOrder?._id,
          ticket: {
            id: order.ticket.id,
            version: order.ticket.version,
          },
          version: updatedOrder?.version!,
        });
      }
      msg.ack();
    } catch (err) {
      if (err instanceof InvalidOrderMethodError) msg.ack();
      else console.error(err);
    }
  };
}
