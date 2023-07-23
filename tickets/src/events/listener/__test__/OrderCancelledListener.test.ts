import mongoose from "mongoose";
import { Ticket } from "../../../models/Ticket";
import { OrderCancelledListener } from "../OrderCancelledListener";
import natsClient from "../../natsClient";
import { Message } from "node-nats-streaming";
import {
  DocumentNotFoundError,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@elytickets/common";

const setup = (ticketId: string) => {
  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticketId,
      version: 0,
    },
    version: 0,
  };
  const listener = new OrderCancelledListener(natsClient.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, listener, msg };
};

it("calls ack when ticket id is not found", async () => {
  const { data, listener, msg } = setup(
    new mongoose.Types.ObjectId().toHexString()
  );
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("doesn't modify ticket when ticket.orderId !== event.id", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const { data, listener, msg } = setup(ticketId);
  const ticket = new Ticket({
    _id: ticketId,
    title: "booboo",
    price: "12345",
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await listener.onMessage(data, msg);

  const modifiedTicket = await Ticket.findDocumentById(ticketId);
  expect(modifiedTicket?.orderId).toEqual(ticket.orderId);
  expect(natsClient.client.publish).not.toHaveBeenCalled();

  expect(msg.ack).toHaveBeenCalled();
});

it("modifies ticket data, returning orderId to undefined when ticket.orderId === event.id even if ticket version is different", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const { data, listener, msg } = setup(ticketId);
  const ticket = new Ticket({
    _id: ticketId,
    title: "booboo",
    price: "12345",
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    orderId: data.id,
  });
  await ticket.save();
  await ticket.save();

  await listener.onMessage(data, msg);

  const modifiedTicket = await Ticket.findDocumentById(ticket?.id);
  expect(modifiedTicket?.orderId).toEqual(undefined);
  expect(natsClient.client.publish).toHaveBeenCalled();

  const mockCall = (natsClient.client.publish as jest.Mock).mock.calls[0];
  expect(mockCall[0]).toEqual(Subjects.ticketUpdated);

  const eventData = JSON.parse(mockCall[1]);
  expect(eventData.orderId).toEqual(undefined);
  expect(msg.ack).toHaveBeenCalled();
});

it("modifies ticket data, returning orderId to undefined when ticket.orderId === event.id", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const { data, listener, msg } = setup(ticketId);
  const ticket = new Ticket({
    _id: ticketId,
    title: "booboo",
    price: "12345",
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    orderId: data.id,
  });
  await ticket.save();

  await listener.onMessage(data, msg);

  const modifiedTicket = await Ticket.findDocumentById(ticket?.id);
  expect(modifiedTicket?.orderId).toEqual(undefined);
  expect(natsClient.client.publish).toHaveBeenCalled();

  const mockCall = (natsClient.client.publish as jest.Mock).mock.calls[0];
  expect(mockCall[0]).toEqual(Subjects.ticketUpdated);

  const eventData = JSON.parse(mockCall[1]);
  expect(eventData.orderId).toEqual(undefined);
  expect(msg.ack).toHaveBeenCalled();
});
