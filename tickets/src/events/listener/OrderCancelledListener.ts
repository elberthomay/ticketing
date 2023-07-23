import {
  AbstractListener,
  Subjects,
  OrderCancelledEvent,
  OrderEventData,
  DocumentNotFoundError,
  QueueGroups,
  VersionError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import TicketUpdatedPublisher from "../TicketUpdatedPublisher";
import _ from "lodash";

export class OrderCancelledListener extends AbstractListener<OrderCancelledEvent> {
  readonly subject = Subjects.orderCancelled;
  queueGroupName = QueueGroups.ticketGroup;
  onMessage = async (event: OrderCancelledEvent["data"], msg: Message) => {
    try {
      const ticket = await Ticket.findDocumentById(event.ticket.id);
      if (!ticket) throw new DocumentNotFoundError("Ticket");
      //if (ticket?.version !== event.ticket.version) throw new VersionError();
      if (ticket.orderId === event.id) {
        ticket?.set("orderId", undefined);
        await ticket?.save();
        const publisher = new TicketUpdatedPublisher(this.client);
        await publisher.publish({
          ..._.pick(ticket, [
            "title",
            "price",
            "ownerId",
            "version",
            "orderId",
          ]),
          id: ticket.id!,
        });
      }
      msg.ack();
    } catch (err: unknown) {
      if (err instanceof DocumentNotFoundError) msg.ack();
      else if (err instanceof VersionError) msg.ack();
      else console.error(err);
    }
  };
}
