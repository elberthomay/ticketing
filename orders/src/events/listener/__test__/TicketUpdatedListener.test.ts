import mongoose from "mongoose";
import natsClient from "../../natsClient";
import { TicketUpdatedListener } from "../TicketUpdatedListener";
import { DocumentNotFoundError, TicketUpdatedEvent } from "@elytickets/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/Ticket";
import { faker } from "@faker-js/faker";

let version = 0;
let id = new mongoose.Types.ObjectId().toHexString();
let ownerId = new mongoose.Types.ObjectId().toHexString();
const setup = () => {
  const listener = new TicketUpdatedListener(natsClient.client);
  const data: TicketUpdatedEvent["data"] = {
    version: version++,
    id: id,
    title: faker.animal.bird(),
    price: faker.commerce.price(),
    ownerId: ownerId,
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

it("throws error when updating nonexistent ticket", async () => {
  setup();
  const { listener, data, msg } = setup();

  await expect(async () => {
    await listener.onMessage(data, msg);
  }).rejects.toThrow(DocumentNotFoundError);
  expect(msg.ack).not.toHaveBeenCalled();
});

it("throws error when updating ticket with wrong version", async () => {
  const { data: initialData } = setup();
  const newTicket = new Ticket({ ...initialData, _id: id });
  setup();
  const { listener, data, msg } = setup();

  await expect(async () => {
    await listener.onMessage(data, msg);
  }).rejects.toThrow(DocumentNotFoundError);
  expect(msg.ack).not.toHaveBeenCalled();
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
