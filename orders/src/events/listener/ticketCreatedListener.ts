import { Message, Stan } from "node-nats-streaming";
import {
  Subjects,
  TicketCreatedEvent,
  TicketEventData,
} from "@elytickets/common";
import Ticket from "../../models/Ticket";
import { AbstractListener } from "@elytickets/common";
import mongoose from "mongoose";

export class TicketCreatedListener extends AbstractListener<TicketCreatedEvent> {
  readonly subject = Subjects.ticketCreated;
  queueGroupName = "orders-service";
  onMessage = async (event: TicketEventData, msg: Message) => {
    const { id, title, price } = event;
    const newTicket = await Ticket.createTicket({
      id: new mongoose.Types.ObjectId(id),
      title,
      price,
    });
    console.log("ticket created event received");
    const ticket = await Ticket.findDocumentById(id);
    console.log(ticket);
    msg.ack();
  };
}
