import { Message } from "node-nats-streaming";
import natsClient from "../../natsClient";
import { ChargeCreatedListener } from "../ChargeCreatedListener";
import mongoose from "mongoose";
import {
  ChargeCreatedEvent,
  OrderStatus,
  PaymentStatus,
  Subjects,
} from "@elytickets/common";
import { Order } from "../../../models/Order";

const setup = () => {
  const listener = new ChargeCreatedListener(natsClient.client);
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, msg };
};

it("doesn't update status if order status has been changed to cancelled", async () => {
  const { listener, msg } = setup();
  const eventData: ChargeCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    amount: 10000,
    orderId: new mongoose.Types.ObjectId().toHexString(),
    chargeId: new mongoose.Types.ObjectId().toHexString(),
    status: PaymentStatus.charged,
    createdAt: Date.now(),
  };

  const newOrder = new Order({
    _id: eventData.orderId,
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.cancelled,
    expiresAt: Date.now() + 60 * 1000,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "ff",
      price: "123",
      version: 0,
    },
  });
  await newOrder.save();

  await listener.onMessage(eventData, msg);

  const updatedOrder = await Order.findDocumentById(eventData.orderId);

  expect(updatedOrder?.status).toEqual(newOrder.status);
  expect(updatedOrder?.expiresAt).toEqual(newOrder.expiresAt);
  expect(updatedOrder?.version).toEqual(newOrder.version);

  // no event is emitted
  expect(natsClient.client.publish).not.toHaveBeenCalled();

  expect(msg.ack).toHaveBeenCalled();
});

it("updates status to complete if order status is awaitingPayment", async () => {
  const { listener, msg } = setup();
  const data: ChargeCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    amount: 10000,
    orderId: new mongoose.Types.ObjectId().toHexString(),
    chargeId: new mongoose.Types.ObjectId().toHexString(),
    status: PaymentStatus.charged,
    createdAt: Date.now(),
  };

  const newOrder = new Order({
    _id: data.orderId,
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.awaitingPayment,
    expiresAt: Date.now() + 60 * 1000,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "ff",
      price: "123",
      version: 0,
    },
  });
  await newOrder.save();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findDocumentById(data.orderId);

  expect(updatedOrder?.status).toEqual(OrderStatus.complete);
  expect(updatedOrder?.expiresAt).toEqual(newOrder.expiresAt);
  expect(updatedOrder?.version).toEqual(newOrder.version + 1);

  // OrderComplete event is emitted
  const mockCall = (natsClient.client.publish as jest.Mock).mock.calls[0];
  expect(mockCall[0]).toEqual(Subjects.orderComplete);

  const eventData = JSON.parse(mockCall[1]);
  expect(eventData.id).toEqual(newOrder.id);

  expect(msg.ack).toHaveBeenCalled();
});
