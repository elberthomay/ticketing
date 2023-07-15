import { Stan } from "node-nats-streaming";
import {
  AbstractPublisher,
  OrderCancelledEvent,
  Subjects,
} from "@elytickets/common";

export default class OrderCancelledPublisher extends AbstractPublisher<OrderCancelledEvent> {
  readonly subject = Subjects.orderCancelled;
  constructor(client: Stan) {
    super(client);
  }
}
