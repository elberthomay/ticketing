import { NotAuthorizedError } from "@elytickets/common";
import { NextFunction, Request, Response } from "express";

export default function compareOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.body?.ticket) {
    const userId = req.currentUser?.id;
    const ownerId = req.body.ticket.sellerId.toString();
    console.log(userId, ownerId, userId === ownerId);
    if (userId === ownerId) next();
    else next(new NotAuthorizedError());
  } else next();
}
