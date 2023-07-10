import express, { NextFunction, Request, Response } from "express";
import Ticket from "../models/Ticket";
import {
  verifyAuth,
  requireAuth,
  checkValidationError,
  NotFoundError,
  wrapAsync,
} from "@elytickets/common";
import validateId from "../middlewares/validateId";
import fetchTicket from "../middlewares/fetchTicket";
import compareOwner from "../middlewares/compareOwner";
import validateTicketData from "../middlewares/validateTicketData";
import natsClient from "../events/natsClient";
import TicketCreatedPublisher from "../events/TicketCreatedPublisher";
import TicketUpdatedPublisher from "../events/TicketUpdatedPublisher";

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
  fetchTicket,
  (req: Request, res: Response) => {
    const { ticket } = req.body;
    if (ticket) res.json(ticket);
    else throw new NotFoundError();
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
    const sellerId = req.currentUser?.id;
    const newTicket = new Ticket({ title, price, sellerId });
    const ticket = await newTicket.save();
    await new TicketCreatedPublisher(natsClient.client).publish({
      id: ticket._id.toHexString(),
      title: ticket.title,
      price: ticket.price,
      sellerId: ticket.sellerId.toHexString(),
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
  fetchTicket,
  compareOwner,
  wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, price, ticket } = req.body;
    if (ticket) {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        {
          title,
          price,
        },
        { new: true }
      );
      if (updatedTicket) {
        await new TicketUpdatedPublisher(natsClient.client).publish({
          id: updatedTicket._id.toHexString(),
          title: updatedTicket.title,
          price: updatedTicket.price,
          sellerId: updatedTicket.sellerId.toHexString(),
        });
        res.json(updatedTicket);
      } else throw new NotFoundError();
    } else throw new NotFoundError();
  })
);

export default router;
