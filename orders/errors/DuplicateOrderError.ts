import { CustomError } from "@elytickets/common";

export class DuplicateOrderError extends CustomError {
  statusCode = 409;
  constructor() {
    super("Existing order already exists");
  }
  serializeError() {
    return [{ message: this.message }];
  }
}
