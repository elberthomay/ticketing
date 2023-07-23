import {
  AbstractPublisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@elytickets/common";

export class ExpirationCompletePublisher extends AbstractPublisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.expirationComplete;
}
