import { Stan } from "node-nats-streaming";
import { AbstractPublisher } from "@elytickets/common";
import { Subjects, OrderCreatedEvent } from "@elytickets/common";

export default class OrderCreatedPublisher extends AbstractPublisher<OrderCreatedEvent> {
  readonly subject = Subjects.orderCreated;
  constructor(client: Stan) {
    super(client);
  }
}
