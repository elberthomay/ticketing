import mongoose from "mongoose";
import {
  DatabaseError,
  DocumentNotFoundError,
  OrderCreateData,
} from "@elytickets/common";
import { OrderData, OrderDoc, OrderModel } from "@elytickets/common";
import { InvalidOrderMethodError } from "../../errors/InvalidOrderMethodError";
import { OrderStatus } from "@elytickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import _ from "lodash";

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
      id: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      price: {
        type: String,
        required: true,
      },
      version: {
        type: Number,
        required: true,
      },
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
  attrs: OrderCreateData
): Promise<OrderDoc | undefined> => {
  try {
    const orderData = {
      ..._.pick(attrs, ["ownerId", "expiresAt", "ticket"]),
      status: OrderStatus.created,
    };
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
    const order = await Order.findById(id);
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
    });
    return orders;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

orderModel.statics.changeOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<OrderDoc | undefined> => {
  const order = await Order.findDocumentById(id);

  if (order === undefined) throw new Error("Error in findDocumentById");

  if (order.status === status) return order;

  switch (status) {
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
      if (order.status === OrderStatus.cancelled) {
        throw new InvalidOrderMethodError(
          "Confirmation is unavailable for cancelled order"
        );
      } else if (order.status === OrderStatus.complete) {
        throw new InvalidOrderMethodError(
          "Confirmation is unavailable for completed order"
        );
      }
      break;
    // Add additional cases if needed for other status transitions

    default:
      throw new Error("Invalid order status in changeOrderStatus");
  }
  try {
    order.set("status", status);
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
