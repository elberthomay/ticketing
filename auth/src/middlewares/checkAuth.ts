import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/UserType";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session?.jwt) {
    try {
      const payload = jwt.verify(
        req.session.jwt,
        process.env.JWT_KEY!
      ) as UserPayload;
      req.currentUser = payload;
    } catch (err) {}
    next();
  } else next();
}
