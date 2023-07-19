import mongoose from "mongoose";
import { DatabaseError, DocumentNotFoundError } from "@elytickets/common";
import { OrderData, OrderDoc, OrderModel } from "../types/OrderType";
import { InvalidOrderMethodError } from "../../errors/InvalidOrderMethodError";
import { OrderStatus } from "@elytickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

const orderModel = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.created,
    },
    expiresAt: {
      type: Number,
      required: true,
    },
    ticket: {
      type: mongoose.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderModel.set("versionKey", "version");
orderModel.plugin(updateIfCurrentPlugin);

// orderModel.pre("save", async function (next) {
//   //check if duplicate order with  non-cancelled status exist
//   const existingOrder = await Order.findOne({
//     _id: this._id,
//     status: { $ne: OrderStatus.cancelled },
//   });
//   console.log(await Order.find({}));
//   if (existingOrder) next(new DuplicateOrderError());
//   else next();
// });

orderModel.statics.createOrder = async (
  attrs: OrderData
): Promise<OrderDoc | undefined> => {
  try {
    const orderData = { ...attrs, status: OrderStatus.created };
    const newOrder = new Order(orderData);
    await newOrder.save();
    return newOrder;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

orderModel.statics.findDocumentById = async (
  id: string
): Promise<OrderDoc | undefined> => {
  try {
    const order = await Order.findById(id).populate("ticket");
    if (order === null) throw new DocumentNotFoundError("Order");
    else return order;
  } catch (err: unknown) {
    if (err instanceof DocumentNotFoundError) throw err;
    else if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

orderModel.statics.findAllActiveOrderByBuyerId = async (
  id: string
): Promise<OrderDoc[] | undefined> => {
  try {
    const orders = Order.find({
      ownerId: id,
      status: { $in: [OrderStatus.created, OrderStatus.awaitingPayment] },
    }).populate("ticket");
    return orders;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

orderModel.statics.changeOrderStatus = async (
  id: string,
  newStatus: OrderStatus
): Promise<OrderDoc | undefined> => {
  const order = await Order.findDocumentById(id);

  if (order === undefined) throw new Error("Error in findDocumentById");

  if (order.status === newStatus) return order;

  switch (newStatus) {
    case OrderStatus.cancelled:
      if (order.status === OrderStatus.complete) {
        throw new InvalidOrderMethodError(
          "Cancellation is unavailable for completed order"
        );
      }
      break;
    case OrderStatus.complete:
      if (order.status === OrderStatus.created) {
        throw new InvalidOrderMethodError(
          "Completion is unavailable for unverified order"
        );
      } else if (order.status === OrderStatus.cancelled) {
        throw new InvalidOrderMethodError(
          "Completion is unavailable for cancelled order"
        );
      }
      break;
    case OrderStatus.awaitingPayment:
      if (order.status === OrderStatus.complete) {
        throw new InvalidOrderMethodError(
          "Verification is unavailable for completed order"
        );
      }
      break;
    // Add additional cases if needed for other status transitions

    default:
      throw new Error("Invalid order status in changeOrderStatus");
  }
  try {
    order.set("status", newStatus);
    await order.save();
    return order;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

orderModel.statics.cancelOrderById = async (
  id: string
): Promise<OrderDoc | undefined> => {
  return Order.changeOrderStatus(id, OrderStatus.cancelled);
};

orderModel.statics.completeOrderById = async (
  id: string
): Promise<OrderDoc | undefined> => {
  return Order.changeOrderStatus(id, OrderStatus.complete);
};

orderModel.statics.verifyOrderById = async (
  id: string
): Promise<OrderDoc | undefined> => {
  return Order.changeOrderStatus(id, OrderStatus.awaitingPayment);
};

export const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderModel);
