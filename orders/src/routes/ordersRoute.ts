import {
  OrderTicketDoc,
  checkValidationError,
  compareOwner,
  fetchDocument,
  requireAuth,
  verifyAuth,
  wrapAsync,
} from "@elytickets/common";
import express, { Request, Response } from "express";
import validateId from "../middlewares/validateId";
import { moveId } from "../middlewares/moveId";
import validateTicketId from "../middlewares/validateTicketId";
import { moveTicketId } from "../middlewares/moveTicketId";
import { Order } from "../models/Order";
import Ticket from "../models/Ticket";
import { DuplicateOrderError } from "../../errors/DuplicateOrderError";
import OrderCreatedPublisher from "../events/OrderCreatedPublisher";
import natsClient from "../events/natsClient";
import OrderCancelledPublisher from "../events/OrderCancelledPublisher";
import _ from "lodash";

const router = express.Router();

const unverifiedExpireDelay = 2 * 60 * 1000;

router.get(
  "/",
  verifyAuth,
  requireAuth,
  wrapAsync(async (req: Request, res: Response) => {
    const currentUserId = req.currentUser?.id;
    if (currentUserId) {
      const orders = await Order.findAllActiveOrderByBuyerId(currentUserId);
      res.json(orders);
    } else throw new Error("route is not preceeded by requireAuth middleware");
  })
);

router.get(
  "/:id",
  verifyAuth,
  requireAuth,
  validateId,
  checkValidationError,
  moveId,
  fetchDocument(Order, true),
  compareOwner("Order"),
  (req: Request, res: Response) => {
    const order = req?.document?.Order;
    if (order) res.json(order);
    else throw new Error("Something went wrong in order retrieval");
  }
);

router.post(
  "/",
  verifyAuth,
  requireAuth,
  validateTicketId,
  checkValidationError,
  moveTicketId,
  fetchDocument(Ticket, true),
  wrapAsync(async (req: Request, res: Response) => {
    // get ownerId from currentUser
    const ownerId = req?.currentUser?.id;
    if (!ownerId) throw new Error("Route is not preceeded by requireAuth");

    // retrieve fetched TicketDoc and check if ticket is reserved
    const ticket: OrderTicketDoc = req?.document?.Ticket as OrderTicketDoc;
    if (ticket && (await ticket.isReserved())) throw new DuplicateOrderError();

    // save new order
    const newOrderData = {
      expiresAt: Date.now() + unverifiedExpireDelay,
      ownerId: ownerId,
      ticket: {
        ..._.pick(ticket, ["title", "price", "version"]),
        id: ticket.id!,
      },
    };
    const newOrder = await Order.createOrder(newOrderData);
    if (!newOrder) throw new Error("Error in database operation");

    //send OrderCreatedEvent
    const eventPub = new OrderCreatedPublisher(natsClient.client);
    const { id, expiresAt, status, version } = newOrder;
    eventPub.publish({
      id,
      expiresAt,
      status,
      ownerId,
      ticket: {
        id: ticket._id,
        title: ticket.title,
        price: ticket.price,
        version: ticket.version,
      },
      version: version,
    });
    res.json(newOrder);
  })
);

router.delete(
  "/:id",
  verifyAuth,
  requireAuth,
  validateId,
  checkValidationError,
  moveId,
  fetchDocument(Order, true),
  compareOwner("Order"),
  wrapAsync(async (req: Request, res: Response) => {
    const id = req?.ids?.Order;
    if (!id) throw new Error("Route is not preceeded by moveId");

    const cancelledOrder = await Order.cancelOrderById(id);
    if (!cancelledOrder) throw new Error("Database operation went wrong");

    //send event OrderCancelled
    //send OrderCreatedEvent
    const eventPub = new OrderCancelledPublisher(natsClient.client);
    eventPub.publish({
      id,
      ticket: {
        id: cancelledOrder.ticket.id,
        title: cancelledOrder.ticket.title,
        price: cancelledOrder.ticket.price,
        version: cancelledOrder.ticket.version,
      },
      version: cancelledOrder.version,
    });
    res.json(cancelledOrder);
  })
);

export default router;
