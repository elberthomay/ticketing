import { NextFunction, Request, Response } from "express";
import { Password } from "../services/Password";
import { AuthenticationError } from "@elytickets/common";

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user, password } = req.body;
  if (user) {
    const authSuccess = await Password.compare(password, user.password);
    if (authSuccess) next();
    else next(new AuthenticationError());
  } else {
    next(new AuthenticationError());
  }
}
