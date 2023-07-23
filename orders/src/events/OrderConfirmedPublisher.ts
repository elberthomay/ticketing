import { Stan } from "node-nats-streaming";
import {
  AbstractPublisher,
  OrderCancelledEvent,
  OrderConfirmedEvent,
  Subjects,
} from "@elytickets/common";

export default class OrderConfirmedPublisher extends AbstractPublisher<OrderConfirmedEvent> {
  readonly subject = Subjects.orderConfirmed;
  constructor(client: Stan) {
    super(client);
  }
}
