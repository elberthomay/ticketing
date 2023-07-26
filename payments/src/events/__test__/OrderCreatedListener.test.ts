import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@elytickets/common";
import { OrderCreatedListener } from "../OrderCreatedListener";
import natsClient from "../natsClient";
import { Message } from "node-nats-streaming";
import Order from "../../models/Order";

const setup = () => {
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
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

  const listener = new OrderCreatedListener(natsClient.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { data, listener, msg };
};

it("creates new entry in Order", async () => {
  const { data, listener, msg } = setup();
  await listener.onMessage(data, msg);
  const newOrder = await Order.findDocumentById(data.id);

  expect(newOrder).toBeDefined();
  expect(newOrder?.status).toEqual(data.status);
  expect(newOrder?.ticket?.price).toEqual(data.ticket.price);
  expect(newOrder?.ownerId).toEqual(data.ownerId);
  expect(newOrder?.version).toEqual(data.version);

  expect(msg.ack).toHaveBeenCalled();
});
