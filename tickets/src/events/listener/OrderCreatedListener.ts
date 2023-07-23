import {
  AbstractListener,
  Subjects,
  OrderCreatedEvent,
  OrderEventData,
  DocumentNotFoundError,
  QueueGroups,
  VersionError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import TicketUpdatedPublisher from "../TicketUpdatedPublisher";
import { TicketLockedError } from "../../errors/TicketLockedError";
import _ from "lodash";

export class OrderCreatedListener extends AbstractListener<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  queueGroupName = QueueGroups.ticketGroup;
  onMessage = async (event: OrderEventData, msg: Message) => {
    try {
      //should lock the doc first
      const ticket = await Ticket.findDocumentById(event.ticket.id);
      if (ticket?.version !== event.ticket.version) throw new VersionError();
      if (ticket.orderId) throw new TicketLockedError();

      ticket?.set("orderId", event.id);
      await ticket?.save();
      const publisher = new TicketUpdatedPublisher(this.client);
      await publisher.publish({
        ..._.pick(ticket, ["title", "price", "ownerId", "version", "orderId"]),
        id: ticket.id!,
      });
      msg.ack();
    } catch (err: unknown) {
      if (err instanceof DocumentNotFoundError) msg.ack();
      else if (err instanceof VersionError) msg.ack();
      else if (err instanceof TicketLockedError) msg.ack();
      else console.error(err);
    }
  };
}
