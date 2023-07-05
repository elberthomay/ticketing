import { CustomError } from "../types/CustomError";

export class NotFoundError extends CustomError {
  statusCode = 404;
  constructor() {
    super("Route not found");
  }

  serializeError() {
    return [{ message: "Not Found" }];
  }
}
