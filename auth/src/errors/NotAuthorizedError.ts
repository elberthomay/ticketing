import { CustomError } from "../types/CustomError";

export class NotAuthorizedError extends CustomError {
  constructor() {
    super("Not Authorized");
  }
  statusCode = 401;
  serializeError() {
    return [{ message: "Not Authorized" }];
  }
}
