import { CustomError } from "@elytickets/common";
import Joi from "joi";

export class ValidationError extends CustomError {
  statusCode: number = 400;
  constructor(private errors: Joi.ValidationError) {
    super(errors.details.map((error) => error.message).join(", "));
  }
  serializeError() {
    return this.errors.details.map((error) => ({
      message: error.message,
      field: error.path.join("."),
    }));
  }
}
