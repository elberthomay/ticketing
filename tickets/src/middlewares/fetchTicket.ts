import { NextFunction, Request, Response } from "express";
import Ticket from "../models/Ticket";
import { wrapAsync } from "@elytickets/common";

export default wrapAsync(async function fetchTicket(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const ticket = await Ticket.findTicketById(id);
  if (ticket) req.body.ticket = ticket;
  next();
});
