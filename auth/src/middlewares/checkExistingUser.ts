import { NextFunction, Request, Response } from "express";
import { User } from "../models";
import { DuplicateError } from "../errors/DuplicateError";
import { RequestValidationError } from "../errors/RequestValidationError";

async function emailExist(email: string): Promise<boolean> {
  const user = await User.findOne({ email });
  return user !== null;
}

export async function checkExistingUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  const exist = await emailExist(email);
  if (exist) next(new DuplicateError("email"));
  else next();
}

export async function checkEmailExist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  const exist = await emailExist(email);
  if (!exist) next(new Error("email not found"));
  else next();
}
