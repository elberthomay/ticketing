import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { wrapAsync } from "@elytickets/common";
import { ValidationError } from "../errors/ValidationError";
export default function validateBody(schema: Joi.Schema) {
  return wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });
    if (error) throw new ValidationError(error);
    else next();
  });
}
