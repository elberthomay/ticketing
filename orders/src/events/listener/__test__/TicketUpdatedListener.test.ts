import mongoose from "mongoose";
import natsClient from "../../natsClient";
import { TicketUpdatedListener } from "../TicketUpdatedListener";
import {
  DocumentNotFoundError,
  OrderData,
  OrderStatus,
  Subjects,
  TicketUpdatedEvent,
} from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/Ticket";
import { faker } from "@faker-js/faker";
import { Order } from "../../../models/Order";
import _, { update } from "lodash";

let version = 0;
let id = new mongoose.Types.ObjectId().toHexString();
let ownerId = new mongoose.Types.ObjectId().toHexString();
const setup = (orderId?: string) => {
  const listener = new TicketUpdatedListener(natsClient.client);
  const data: TicketUpdatedEvent["data"] = {
    version: version++,
    id,
    title: faker.animal.bird(),
    price: faker.commerce.price(),
    ownerId,
    orderId,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, listener, msg };
};

beforeEach(() => {
  version = 0;
});

it("doesn't call ack when updating nonexistent ticket", async () => {
  setup();
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).not.toHaveBeenCalled();
});

it("doesn't call ack when updating ticket with wrong version", async () => {
  const { data: initialData } = setup();
  const newTicket = new Ticket({ ...initialData, _id: id });
  setup();
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).not.toHaveBeenCalled();
});

it("status unchanged if order status is cancelled", async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  setup();
  const { data, listener, msg } = setup(orderId);
  const newTicket = new Ticket({ ...data, _id: id });
  await newTicket.save();

  const newOrder = new Order({
    _id: orderId,
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.cancelled,
    expiresAt: Date.now() + 60 * 1000,
    ticket: _.pick(newTicket, ["id", "title", "price", "version"]),
  });
  await newOrder.save();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findDocumentById(data.id);
  const updatedOrder = await Order.findDocumentById(orderId);

  //updatedTicket data should be unchanged
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);

  //order should be unchanged
  expect(updatedOrder?.status).toEqual(newOrder.status);
  expect(updatedOrder?.expiresAt).toEqual(newOrder.expiresAt);
  expect(updatedOrder?.version).toEqual(newOrder.version);

  // no event is emitted
  expect(natsClient.client.publish).not.toHaveBeenCalled();

  //ack called
  expect(msg.ack).toHaveBeenCalled();
});

it("change status of order to OrderStatus.awaitingPayment if orderId is defined", async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  setup(); //increment version
  const { data, listener, msg } = setup(orderId);
  const newTicket = new Ticket({ ...data, _id: id });
  await newTicket.save();

  const newOrder = new Order({
    _id: orderId,
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.created,
    expiresAt: Date.now() + 60 * 1000,
    ticket: _.pick(newTicket, ["id", "title", "price", "version"]),
  });
  await newOrder.save();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findDocumentById(data.id);
  const updatedOrder = await Order.findDocumentById(orderId);

  //updatedTicket data should be unchanged
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);

  //order status should be awaitingPayment with incremented version
  expect(updatedOrder?.status).toEqual(OrderStatus.awaitingPayment);
  // expiration time should be extended
  expect(updatedOrder?.expiresAt).toBeGreaterThan(Date.now() + 60 * 1000);
  expect(updatedOrder?.version).toEqual(newOrder.version + 1);

  // emit orderConfirmed event
  const mockCall = (natsClient.client.publish as jest.Mock).mock.calls[0];
  expect(mockCall[0]).toEqual(Subjects.orderConfirmed);

  const eventData = JSON.parse(mockCall[1]);
  expect(eventData.id).toEqual(orderId);

  expect(msg.ack).toHaveBeenCalled();
});

it("updates and calls ack when updated with the correct version", async () => {
  const { data: initialData } = setup();
  const newTicket = new Ticket({ ...initialData, _id: id });
  await newTicket.save();
  console.log(newTicket.id);

  const { listener, data, msg } = setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findDocumentById(data.id);
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
  expect(msg.ack).toHaveBeenCalled();
});
