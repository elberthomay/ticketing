import { Request, NextFunction, Response } from "express";
import { User } from "../models";
import { DatabaseError } from "@elytickets/common";

export async function fetchUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  if (email) {
    try {
      const user = await User.findOne({ email });
      if (user) req.body.user = user;
      next();
    } catch (err: unknown) {
      if (err instanceof Error) next(new DatabaseError(err.message));
    }
  } else next();
}
