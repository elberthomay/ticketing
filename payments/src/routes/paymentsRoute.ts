import {
  OrderStatus,
  compareOwner,
  fetchDocument,
  requireAuth,
  verifyAuth,
  wrapAsync,
} from "@elytickets/common";
import { Router } from "express";
import validateBody from "../middleware/validateBody";
import createChargeSchema from "../schemas/createChargeSchema";
import moveOrderId from "../middleware/moveOrderId";
import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import { PaymentOrderDoc, PaymentStatus } from "@elytickets/common";
import { InvalidOrderMethodError } from "../errors/InvalidOrderMethodError";
import stripe from "../stripe";
import { Charge } from "../models/Charge";
import { ChargeCreatedPublisher } from "../events/ChargeCreatedPublisher";
import natsClient from "../events/natsClient";
import _ from "lodash";

const router = Router();

router.post(
  "/",
  verifyAuth,
  requireAuth,
  validateBody(createChargeSchema),
  moveOrderId,
  fetchDocument(Order, true),
  compareOwner("Order"),
  wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const order = req?.document?.Order as PaymentOrderDoc;
    const { token } = req.body;
    if (order.status !== OrderStatus.awaitingPayment)
      throw new InvalidOrderMethodError(`Order status is not Awaiting:payment`);

    const existingCharge = await Charge.findByOrderId(order.id);
    if (existingCharge) res.status(200).json(existingCharge);

    //create charge
    const result = await stripe.charges.create({
      currency: "usd",
      amount: Math.round(parseFloat(order.ticket.price) * 100),
      source: token,
    });
    const charge = await Charge.createCharge({
      chargeId: result.id,
      orderId: order.id,
      amount: result.amount,
      status: PaymentStatus.charged,
      createdAt: Date.now(),
    });
    if (!charge) throw new Error("database error");
    const chargeCreatedPublisher = new ChargeCreatedPublisher(
      natsClient.client
    );
    await chargeCreatedPublisher.publish({
      id: charge?.id!,
      ..._.pick(charge, [
        "chargeId",
        "orderId",
        "amount",
        "status",
        "createdAt",
      ]),
    });
    res.status(201).json(charge);
  })
);

export default router;
