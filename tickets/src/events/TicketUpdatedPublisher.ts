import { Stan } from "node-nats-streaming";
import { AbstractPublisher } from "@elytickets/common";
import { Subjects, TicketUpdatedEvent } from "@elytickets/common";
export default class TicketUpdatedPublisher extends AbstractPublisher<TicketUpdatedEvent> {
  readonly subject = Subjects.ticketUpdated;
  constructor(client: Stan) {
    super(client);
  }
}
