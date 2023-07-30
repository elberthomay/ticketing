import { Message, Stan } from "node-nats-streaming";
import {
  Subjects,
  TicketCreatedEvent,
  TicketEventData,
} from "@elytickets/common";
import Ticket from "../../models/Ticket";
import { AbstractListener } from "@elytickets/common";
import _ from "lodash";

export default class TicketCreatedListener extends AbstractListener<TicketCreatedEvent> {
  readonly subject = Subjects.ticketCreated;
  queueGroupName = "orders-service";
  onMessage = async (event: TicketEventData, msg: Message) => {
    const newTicket = await Ticket.createTicket(
      _.pick(event, ["id", "title", "price"])
    );
    msg.ack();
  };
}
