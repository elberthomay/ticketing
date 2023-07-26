import mongoose from "mongoose";
import Order from "../models/Order";
import { OrderStatus } from "@elytickets/common";

export async function addOrder(
  ticket: any,
  ownerId: string,
  status: OrderStatus
) {
  const newOrder = await Order.createOrder({
    id: new mongoose.Types.ObjectId().toHexString(),
    ownerId: ownerId,
    status: status,
    ticket: {
      id: ticket._id,
      price: ticket.price,
    },
    version: 0,
  });
  return newOrder?._id;
}
