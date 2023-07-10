import AbstractListener from "./AbstractListener";
import nats, { Message } from "node-nats-streaming";
import { Subjects, TicketCreatedEvent } from "./types/EventTypes";

export class TicketCreatedListener extends AbstractListener<TicketCreatedEvent> {
  readonly subject = Subjects.ticketCreated;
  queueGroupName: string;
  onMessage: (event: TicketCreatedEvent["data"], msg: Message) => void;
  constructor(
    queueGroupName: string,
    onMessage: (event: TicketCreatedEvent["data"], msg: Message) => void,
    client: nats.Stan
  ) {
    super(client);
    this.queueGroupName = queueGroupName;
    this.onMessage = onMessage;
  }
}
