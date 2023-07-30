import mongoose from "mongoose";
import natsClient from "../../natsClient";
import TicketCreatedListener from "../TicketCreatedListener";
import { Subjects, TicketCreatedEvent } from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/Ticket";

const setup = () => {
  const listener = new TicketCreatedListener(natsClient.client);
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "no shit sherlock",
    price: "12345678",
    ownerId: new mongoose.Types.ObjectId().toHexString(),
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { data, listener, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = setup();
  await listener.onMessage(data, msg);
  const newTicket = await Ticket.findDocumentById(data.id);
  expect(newTicket?.title).toEqual(data.title);
  expect(newTicket?.price).toEqual(data.price);
  expect(newTicket?.version).toEqual(0);
});

it("calls msg.ack()", async () => {
  const { listener, data, msg } = setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
