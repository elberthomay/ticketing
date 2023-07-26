import { Request, Response, NextFunction } from "express";
export default function moveOrderId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.ids ??= {};
  req.ids.Order = req.body.orderId;
  next();
}
