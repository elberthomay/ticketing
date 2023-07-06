import { ValidationError } from "express-validator";
import { CustomError } from "@elytickets/common";
export class RequestValidationError extends CustomError {
  statusCode: number;
  constructor(public errors: ValidationError[]) {
    super(errors.map((error) => error.msg).join(", "));
    this.errors = errors;
    this.statusCode = 400;
  }
  serializeError() {
    return this.errors.map((error) => {
      if (error.type === "field") {
        return { message: error.msg, field: error.path };
      } else {
        return { message: error.msg };
      }
    });
  }
}
