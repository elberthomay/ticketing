import { Message, Stan } from "node-nats-streaming";
import {
  Subjects,
  TicketUpdatedEvent,
  TicketEventData,
  DocumentNotFoundError,
  OrderStatus,
} from "@elytickets/common";
import Ticket from "../../models/Ticket";
import { AbstractListener } from "@elytickets/common";
import { Order } from "../../models/Order";
import OrderCancelledPublisher from "../OrderCancelledPublisher";
import _ from "lodash";
import OrderConfirmedPublisher from "../OrderConfirmedPublisher";
import { InvalidOrderMethodError } from "../../../errors/InvalidOrderMethodError";

const verifiedExpireDelay = 15 * 60 * 1000;

export class TicketUpdatedListener extends AbstractListener<TicketUpdatedEvent> {
  readonly subject = Subjects.ticketUpdated;
  queueGroupName = "orders-service";
  onMessage = async (event: TicketEventData, msg: Message) => {
    try {
      const { id, title, price, version } = event;

      const ticket = await Ticket.findByIdAndVersion(event);
      if (!ticket) throw new DocumentNotFoundError("Ticket");

      ticket.set({ title, price, version });
      await ticket.save();
      if (event.orderId) {
        const newExpiresAt = Date.now() + verifiedExpireDelay;
        await Order.verifyOrderById(event.orderId);
        const order = await Order.findByIdAndUpdate(event.orderId, {
          expiresAt: newExpiresAt,
        });
        const orderConfirmedPub = new OrderConfirmedPublisher(this.client);
        await orderConfirmedPub.publish({
          id: event.orderId,
          expiresAt: newExpiresAt,
          version: order?.version!,
        });

        // const otherOrders = await Order.find({
        //   ticket: { id: id },
        //   _id: { $ne: event.orderId },
        //   status: OrderStatus.created,
        // });

        // await Promise.all(
        //   otherOrders.map((order) => Order.cancelOrderById(order.id))
        // );
        // const orderCancelledPub = new OrderCancelledPublisher(this.client);
        // await Promise.all(
        //   otherOrders.map((order) =>
        //     orderCancelledPub.publish({
        //       id: order.id,
        //       version: order.version,
        //       ticket: _.pick(order.ticket, ["id", "version"]),
        //     })
        //   )
        // );
      }

      msg.ack();
    } catch (err) {
      if (err instanceof InvalidOrderMethodError) msg.ack();
    }
  };
}
