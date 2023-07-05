import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../errors/NotAuthorizedError";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.currentUser) {
    next();
  } else throw new NotAuthorizedError();
}
