import {
  AbstractListener,
  Subjects,
  OrderCreatedEvent,
  OrderEventData,
  DocumentNotFoundError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import TicketUpdatedPublisher from "../TicketUpdatedPublisher";

export class OrderCreatedListener extends AbstractListener<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  queueGroupName: string = "tickets-service";
  onMessage = async (event: OrderEventData, msg: Message) => {
    const ticket = await Ticket.findDocumentById(event.ticket.id);
    if (!ticket) throw new DocumentNotFoundError("Ticket");
    ticket?.set("orderId", event.id);
    await ticket?.save();
    const publisher = new TicketUpdatedPublisher(this.client);
    await publisher.publish({ ...ticket.toObject(), id: ticket._id });
    msg.ack();
  };
}
