import { Stan } from "node-nats-streaming";
import { AbstractPublisher } from "@elytickets/common";
import { Subjects, TicketCreatedEvent } from "@elytickets/common";
export default class TicketCreatedPublisher extends AbstractPublisher<TicketCreatedEvent> {
  readonly subject = Subjects.ticketCreated;
  constructor(client: Stan) {
    super(client);
  }
}
