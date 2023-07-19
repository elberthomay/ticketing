import { Message, Stan } from "node-nats-streaming";
import {
  Subjects,
  OrderExpiredEvent,
  OrderEventData,
} from "@elytickets/common";
import { AbstractListener } from "@elytickets/common";
import { Order } from "../../models/Order";
import { InvalidOrderMethodError } from "../../../errors/InvalidOrderMethodError";
import OrderCancelledPublisher from "../OrderCancelledPublisher";

export class OrderExpiredListener extends AbstractListener<OrderExpiredEvent> {
  readonly subject = Subjects.orderExpired;
  queueGroupName = "orders-service";
  onMessage = async (event: OrderEventData, msg: Message) => {
    const { id } = event;
    const order = await Order.findDocumentById(id);
    if (!order) throw new Error("Invalid order id from OrderExpired event");
    try {
      const updatedOrder = await Order.cancelOrderById(id);
      console.log("OrderExpired event received");
      console.log(updatedOrder);
      const orderCancelledPub = new OrderCancelledPublisher(this.client);
      await orderCancelledPub.publish({
        id: updatedOrder?._id,
        ticket: {
          id: order.ticket._id.toHexString(),
        },
        version: order.version,
      });
      msg.ack();
    } catch (err) {
      if (!(err instanceof InvalidOrderMethodError)) throw err;
    }
  };
}
