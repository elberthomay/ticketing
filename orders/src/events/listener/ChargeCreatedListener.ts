import {
  AbstractListener,
  ChargeCreatedEvent,
  ChargeData,
  DatabaseError,
  OrderStatus,
  QueueGroups,
  Subjects,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { InvalidOrderMethodError } from "../../../errors/InvalidOrderMethodError";
import { OrderCompletePublisher } from "../OrderCompletePublisher";
import _ from "lodash";

export class ChargeCreatedListener extends AbstractListener<ChargeCreatedEvent> {
  readonly subject = Subjects.chargeCreated;
  queueGroupName: string = QueueGroups.orderGroup;
  onMessage = async (event: ChargeData, msg: Message) => {
    try {
      const order = await Order.completeOrderById(event.orderId);
      if (order) {
        const orderCompletePublisher = new OrderCompletePublisher(this.client);
        orderCompletePublisher.publish({
          id: order.id!,
          ..._.pick(order, ["id", "ticket", "version"]),
        });
      }
      msg.ack();
    } catch (err) {
      if (err instanceof InvalidOrderMethodError) msg.ack();
      else if (err instanceof DatabaseError) console.error(err);
      else throw err;
    }
  };
}
