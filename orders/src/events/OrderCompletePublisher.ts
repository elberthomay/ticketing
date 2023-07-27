import {
  AbstractPublisher,
  OrderCompleteEvent,
  Subjects,
} from "@elytickets/common";

export class OrderCompletePublisher extends AbstractPublisher<OrderCompleteEvent> {
  readonly subject = Subjects.orderComplete;
}
