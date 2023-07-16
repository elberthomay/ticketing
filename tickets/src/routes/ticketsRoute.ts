import express, { NextFunction, Request, Response } from "express";
import {
  verifyAuth,
  requireAuth,
  checkValidationError,
  NotFoundError,
  wrapAsync,
  fetchDocument,
  compareOwner,
} from "@elytickets/common";
import { Ticket } from "../models/Ticket";
import validateId from "../middlewares/validateId";
import validateTicketData from "../middlewares/validateTicketData";
import natsClient from "../events/natsClient";
import TicketCreatedPublisher from "../events/TicketCreatedPublisher";
import TicketUpdatedPublisher from "../events/TicketUpdatedPublisher";
import { moveId } from "../middlewares/moveId";
import { TicketDoc } from "../types/TicketType";
import { TicketLockedError } from "../errors/TicketLockedError";

const router = express.Router();

// get all tickets
router.get(
  "/api/tickets",
  wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tickets = await Ticket.findAll();
    res.json(tickets);
  })
);

//get ticket by id
router.get(
  "/api/tickets/:id",
  validateId,
  checkValidationError,
  moveId,
  fetchDocument(Ticket, true),
  (req: Request, res: Response) => {
    const ticket = req?.document?.Ticket;
    res.json(ticket);
  }
);

//add new ticket
router.post(
  "/api/tickets",
  verifyAuth,
  requireAuth,
  validateTicketData,
  checkValidationError,
  wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, price } = req.body;
    const ownerId = req.currentUser?.id;
    const newTicket = new Ticket({ title, price, ownerId });
    const ticket = await newTicket.save();
    await new TicketCreatedPublisher(natsClient.client).publish({
      id: ticket._id.toHexString(),
      title: ticket.title,
      price: ticket.price,
      ownerId: ticket.ownerId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    res.status(201).json(ticket);
  })
);

//update ticket with specified id
router.put(
  "/api/tickets/:id",
  verifyAuth,
  requireAuth,
  validateId,
  validateTicketData,
  checkValidationError,
  moveId,
  fetchDocument(Ticket, true),
  compareOwner("Ticket"),
  wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, price } = req.body;
    const ticket = req?.document?.Ticket! as TicketDoc;
    if (ticket) {
      if (ticket.orderId) throw new TicketLockedError();

      ticket.set({ title, price });
      await ticket.save();

      await new TicketUpdatedPublisher(natsClient.client).publish({
        id: ticket._id.toHexString(),
        title: ticket.title,
        price: ticket.price,
        ownerId: ticket.ownerId,
        version: ticket.version,
        orderId: ticket.orderId,
      });

      res.json(ticket);
    } else throw new NotFoundError();
  })
);

export default router;
