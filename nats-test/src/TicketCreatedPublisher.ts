import { Stan } from "node-nats-streaming";
import AbstractPublisher from "./AbstractPublisher";
import { Subjects, TicketCreatedEvent } from "./types/EventTypes";
export default class TicketCreatedPublisher extends AbstractPublisher<TicketCreatedEvent> {
  readonly subject = Subjects.ticketCreated;
  constructor(client: Stan) {
    super(client);
  }
}
