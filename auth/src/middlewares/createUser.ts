import { Request, NextFunction, Response } from "express";
import { User } from "../models";
import { DatabaseError } from "../errors/DatabaseError";
import { DuplicateError } from "../errors/DuplicateError";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, user } = req.body;
  if (!user) {
    try {
      const user = await User.createUser({ email, password });
      if (user) {
        req.body.user = user;
        next();
      } else next(new DatabaseError("error creating user"));
    } catch (err: unknown) {
      if (err instanceof Error) next(new DatabaseError(err.message));
    }
  } else next(new DuplicateError("email"));
}
