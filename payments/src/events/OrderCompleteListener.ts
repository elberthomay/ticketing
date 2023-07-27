import {
  AbstractListener,
  OrderCompleteEvent,
  ChargeData,
  DatabaseError,
  OrderStatus,
  QueueGroups,
  Subjects,
  DocumentNotFoundError,
  VersionError,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Order from "../models/Order";
import _ from "lodash";

export class OrderCompleteListener extends AbstractListener<OrderCompleteEvent> {
  readonly subject = Subjects.orderComplete;
  queueGroupName: string = QueueGroups.orderGroup;
  onMessage = async (event: OrderCompleteEvent["data"], msg: Message) => {
    try {
      const order = await Order.findDocumentById(event.id);
      if (order) {
        if (order.version !== event.version - 1) throw new VersionError();
        order.set("status", OrderStatus.complete);
        await order.save();
        msg.ack();
      }
    } catch (err) {
      if (err instanceof DocumentNotFoundError) console.log(err);
      else if (err instanceof VersionError) console.log(err);
      else if (err instanceof DatabaseError) console.error(err);
      else throw err;
    }
  };
}
