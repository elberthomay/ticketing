import mongoose from "mongoose";
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@elytickets/common";
import { OrderCancelledListener } from "../OrderCancelledListener";
import natsClient from "../natsClient";
import { Message } from "node-nats-streaming";
import Order from "../../models/Order";

const createOrder = async (id: string) => {
  const data: OrderCreatedEvent["data"] = {
    id,
    expiresAt: Date.now() + 15 * 60 * 1000,
    status: OrderStatus.created,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "HotPlate Bondoock",
      price: "150",
      version: 0,
    },
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };

  const newOrder = await Order.createOrder(data);

  return newOrder;
};

const setup = (version: number) => {
  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "HotPlate Bondoock",
      price: "150",
      version: 0,
    },
    version,
  };

  const listener = new OrderCancelledListener(natsClient.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg };
};

it("doesn't update or ack if version is not valid", async () => {
  const { data, listener, msg } = setup(2);
  const newOrder = await createOrder(data.id);

  await listener.onMessage(data, msg);
  const order = await Order.findDocumentById(data.id);

  expect(order).toBeDefined();
  expect(order?.status).toEqual(newOrder?.status);
  expect(order?.version).toEqual(newOrder?.version);

  expect(msg.ack).not.toHaveBeenCalled();
});

it("change status to cancelled and ack the message", async () => {
  const { data, listener, msg } = setup(1);
  const newOrder = await createOrder(data.id);

  await listener.onMessage(data, msg);
  const order = await Order.findDocumentById(data.id);

  expect(order).toBeDefined();
  expect(order?.status).toEqual(OrderStatus.cancelled);
  expect(order?.version).toEqual(data?.version);

  expect(msg.ack).toHaveBeenCalled();
});
