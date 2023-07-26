import {
  OrderStatus,
  DatabaseError,
  DocumentNotFoundError,
} from "@elytickets/common";
import mongoose from "mongoose";
import {
  PaymentOrderData,
  PaymentOrderDoc,
  PaymentOrderModel,
} from "@elytickets/common";

import { updateIfCurrentPlugin } from "mongoose-update-if-current";

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.created,
  },
  ticket: {
    id: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  ownerId: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
});

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.createOrder = async (newOrderData: PaymentOrderData) => {
  try {
    const newOrder = new Order({
      _id: newOrderData.id,
      ...newOrderData,
    });
    await newOrder.save();
    return newOrder;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

orderSchema.statics.findDocumentById = async (id: string) => {
  try {
    const order = await Order.findById(id);
    if (order) return order;
    else throw new DocumentNotFoundError("Order");
  } catch (err: unknown) {
    if (err instanceof DocumentNotFoundError) throw err;
    else if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

const Order = mongoose.model<PaymentOrderDoc, PaymentOrderModel>(
  "Order",
  orderSchema
);

export default Order;
