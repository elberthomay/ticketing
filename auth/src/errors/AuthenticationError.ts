import { CustomError } from "../types/CustomError";

export class AuthenticationError extends CustomError {
  statusCode = 400;
  constructor() {
    super("Email or password is incorrect");
  }
  serializeError() {
    return [{ message: this.message }];
  }
}
