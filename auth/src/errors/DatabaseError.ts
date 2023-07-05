import { CustomError } from "../types/CustomError";

export class DatabaseError extends CustomError {
  reason = "Error connecting to the Database";
  statusCode: number;
  constructor(public message: string) {
    super(message);
    this.statusCode = 500;
  }
  serializeError() {
    return [{ message: this.reason }];
  }
}
