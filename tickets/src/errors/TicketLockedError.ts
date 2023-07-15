import { CustomError } from "@elytickets/common";

export class TicketLockedError extends CustomError {
  statusCode: number = 409;
  constructor() {
    super("Ticket is locked");
  }
  serializeError() {
    return [{ message: this.message }];
  }
}
