import mongoose from "mongoose";
import { Ticket } from "../../../models/Ticket";
import { OrderCreatedListener } from "../OrderCreatedListener";
import natsClient from "../../natsClient";
import { Message } from "node-nats-streaming";
import {
  DocumentNotFoundError,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@elytickets/common";

const setup = (ticketId: string) => {
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ownerId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.created,
    expiresAt: Date.now() + 100 * 15 * 60,
    ticket: {
      id: ticketId,
      price: "12345",
      version: 0,
    },
    version: 0,
  };
  const listener = new OrderCreatedListener(natsClient.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, listener, msg };
};

it("throws DocumentNotFoundError when ticket id is not found", async () => {
  const { data, listener, msg } = setup(
    new mongoose.Types.ObjectId().toHexString()
  );
  await expect(async () => {
    await listener.onMessage(data, msg);
  }).rejects.toThrow(DocumentNotFoundError);
});

it("modifies ticket data, adding orderId", async () => {
  const ticket = await Ticket.createTicket({
    title: "booboo",
    price: "12345",
    ownerId: new mongoose.Types.ObjectId().toHexString(),
  });
  const { data, listener, msg } = setup(ticket?.id);

  await listener.onMessage(data, msg);

  const modifiedTicket = await Ticket.findDocumentById(ticket?.id);
  expect(modifiedTicket?.orderId).toEqual(data.id);
  expect(natsClient.client.publish).toHaveBeenCalled();

  const mockCall = (natsClient.client.publish as jest.Mock).mock.calls[0];
  expect(mockCall[0]).toEqual(Subjects.ticketUpdated);

  console.log(mockCall[1]);
  const eventData = JSON.parse(mockCall[1]);
  expect(eventData.orderId).toEqual(data.id);

  expect(msg.ack).toHaveBeenCalled();
});
