import {
  AbstractPublisher,
  OrderExpiredEvent,
  Subjects,
} from "@elytickets/common";

export class OrderExpiredPublisher extends AbstractPublisher<OrderExpiredEvent> {
  subject: Subjects.orderExpired = Subjects.orderExpired;
}
