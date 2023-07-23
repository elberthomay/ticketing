import { Message } from "node-nats-streaming";
import natsClient from "../../natsClient";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";
import mongoose from "mongoose";
import {
  ExpirationCompleteEvent,
  OrderStatus,
  Subjects,
} from "@elytickets/common";
import { Order } from "../../../models/Order";

const setup = () => {
  const listener = new ExpirationCompleteListener(natsClient.client);
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, msg };
};

it("doesn't update status if order status has been changed to awaitingPayment", async () => {
  const { listener, msg } = setup();
  const eventData: ExpirationCompleteEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.created,
  };

  const newOrder = new Order({
    _id: eventData.id,
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

  await listener.onMessage(eventData, msg);

  const updatedOrder = await Order.findDocumentById(eventData.id);

  expect(updatedOrder?.status).toEqual(newOrder.status);
  expect(updatedOrder?.expiresAt).toEqual(newOrder.expiresAt);
  expect(updatedOrder?.version).toEqual(newOrder.version);

  // no event is emitted
  expect(natsClient.client.publish).not.toHaveBeenCalled();

  expect(msg.ack).toHaveBeenCalled();
});

it("doesn't update status if order status has been changed to cancelled", async () => {
  const { listener, msg } = setup();
  const eventData: ExpirationCompleteEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.awaitingPayment,
  };

  const newOrder = new Order({
    _id: eventData.id,
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

  const updatedOrder = await Order.findDocumentById(eventData.id);

  expect(updatedOrder?.status).toEqual(newOrder.status);
  expect(updatedOrder?.expiresAt).toEqual(newOrder.expiresAt);
  expect(updatedOrder?.version).toEqual(newOrder.version);

  // no event is emitted
  expect(natsClient.client.publish).not.toHaveBeenCalled();

  expect(msg.ack).toHaveBeenCalled();
});

it("updates status if order status hasn't changed", async () => {
  const { listener, msg } = setup();
  const data: ExpirationCompleteEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.awaitingPayment,
  };

  const newOrder = new Order({
    _id: data.id,
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

  const updatedOrder = await Order.findDocumentById(data.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.cancelled);
  expect(updatedOrder?.expiresAt).toEqual(newOrder.expiresAt);
  expect(updatedOrder?.version).toEqual(newOrder.version + 1);

  // OrderCancelled event is emitted
  const mockCall = (natsClient.client.publish as jest.Mock).mock.calls[0];
  expect(mockCall[0]).toEqual(Subjects.orderCancelled);

  const eventData = JSON.parse(mockCall[1]);
  expect(eventData.id).toEqual(newOrder.id);

  expect(msg.ack).toHaveBeenCalled();
});
