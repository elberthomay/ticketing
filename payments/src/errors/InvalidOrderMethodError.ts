import { CustomError } from "@elytickets/common";

export class InvalidOrderMethodError extends CustomError {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.message = message;
  }
  serializeError() {
    return [{ message: this.message }];
  }
}
