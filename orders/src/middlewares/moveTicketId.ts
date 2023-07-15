import { Request, Response, NextFunction } from "express";

export function moveTicketId(req: Request, res: Response, next: NextFunction) {
  const { ticketId } = req.body;
  req.ids ??= {};
  req.ids.Ticket = ticketId;
  next();
}
