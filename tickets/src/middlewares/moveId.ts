import { Request, Response, NextFunction } from "express";

export function moveId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  req.ids ??= {};
  req.ids.Ticket = id;
  next();
}
