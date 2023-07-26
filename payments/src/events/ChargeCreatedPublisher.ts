import {
  AbstractPublisher,
  ChargeCreatedEvent,
  Subjects,
} from "@elytickets/common";

export class ChargeCreatedPublisher extends AbstractPublisher<ChargeCreatedEvent> {
  readonly subject = Subjects.chargeCreated;
}
