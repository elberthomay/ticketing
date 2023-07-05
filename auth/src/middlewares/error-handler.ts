import { NextFunction, Request, Response } from "express";
import { RequestValidationError } from "../errors/RequestValidationError";
import { DatabaseError } from "../errors/DatabaseError";
import { CustomError } from "../types/CustomError";

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError)
    res.status(err.statusCode).json({ errors: err.serializeError() });
  else res.status(500).json({ errors: [{ message: err.message }] });
}
