import {
  AbstractListener,
  Subjects,
  OrderCancelledEvent,
  OrderEventData,
  DocumentNotFoundError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import TicketUpdatedPublisher from "../TicketUpdatedPublisher";

export class OrderCancelledListener extends AbstractListener<OrderCancelledEvent> {
  readonly subject = Subjects.orderCancelled;
  queueGroupName: string = "tickets-service";
  onMessage = async (event: OrderCancelledEvent["data"], msg: Message) => {
    const ticket = await Ticket.findDocumentById(event.ticket.id);
    if (!ticket) throw new DocumentNotFoundError("Ticket");
    ticket?.set("orderId", undefined);
    await ticket?.save();
    const publisher = new TicketUpdatedPublisher(this.client);
    await publisher.publish({ ...ticket.toObject(), id: ticket._id });
    msg.ack();
  };
}
