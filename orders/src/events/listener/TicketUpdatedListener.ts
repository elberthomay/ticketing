import { Message, Stan } from "node-nats-streaming";
import {
  Subjects,
  TicketUpdatedEvent,
  TicketEventData,
  DocumentNotFoundError,
} from "@elytickets/common";
import Ticket from "../../models/Ticket";
import { AbstractListener } from "@elytickets/common";
import mongoose from "mongoose";

export class TicketUpdatedListener extends AbstractListener<TicketUpdatedEvent> {
  readonly subject = Subjects.ticketUpdated;
  queueGroupName = "orders-service";
  onMessage = async (event: TicketEventData, msg: Message) => {
    const { id, title, price, version } = event;

    const ticket = await Ticket.findByIdAndVersion(event);
    if (!ticket) throw new DocumentNotFoundError("Ticket");

    ticket.set({ title, price, version });
    await ticket.save();

    if (ticket) {
      console.log("ticket updated event received");
      const ticket = await Ticket.findDocumentById(id);
      console.log(ticket);
      msg.ack();
    } else console.error(new Error("Id from event is invalid"));
  };
}
