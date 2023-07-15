import { TicketDoc } from "./TicketType";
import mongoose from "mongoose";
import { OrderStatus } from "@elytickets/common";

export interface OrderData {
  expiresAt: number;
  ticket: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
}

export interface OrderDoc extends mongoose.Document {
  expiresAt: number;
  status: OrderStatus;
  ticket: TicketDoc;
  ownerId: mongoose.Types.ObjectId;
  version: number;
}

export interface OrderModel extends mongoose.Model<OrderDoc> {
  findAllActiveOrderByBuyerId(id: string): Promise<OrderDoc[] | undefined>;
  cancelOrderById(id: string): Promise<OrderDoc | undefined>;
  changeOrderStatus(
    id: string,
    cancelled: OrderStatus
  ): Promise<OrderDoc | undefined>;
  createOrder(order: OrderData): Promise<OrderDoc | undefined>;
  findDocumentById(id: string): Promise<OrderDoc | undefined>;
}
