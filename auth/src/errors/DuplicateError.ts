import { CustomError } from "@elytickets/common";

export class DuplicateError extends CustomError {
  statusCode = 400;
  constructor(private field: string) {
    super(`${field} already exists`);
  }
  serializeError() {
    return [{ message: this.message, field: this.field }];
  }
}
