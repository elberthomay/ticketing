import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function createWebToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req.body;
  const jsonwebtoken = jwt.sign(
    {
      id: user?._id,
      email: user?.email,
    },
    process.env.JWT_KEY!
  );
  req.session = {
    jwt: jsonwebtoken,
  };
  next();
}
