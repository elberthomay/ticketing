import mongoose from "mongoose";
import { Ticket } from "../Ticket";
import { DatabaseError } from "@elytickets/common";

it("implements optimistic concurrency control", async () => {
  //create new ticket
  const newTicket = await Ticket.createTicket({
    title: "no",
    price: "53555",
    ownerId: new mongoose.Types.ObjectId("ac9643acfe08c0a8c7b6c80a"),
  });
  const fetchedTicket = await Ticket.findDocumentById(newTicket?._id);

  newTicket?.set("price", "645675");
  await newTicket?.save();

  try {
    fetchedTicket?.set("title", "blue");
    await fetchedTicket?.save();
  } catch (err) {
    return;
  }
  throw new Error("OCC not implemented");
});

it("increments version correctly", async () => {
  //create new ticket
  const newTicket = await Ticket.createTicket({
    title: "no",
    price: "53555",
    ownerId: new mongoose.Types.ObjectId("ac9643acfe08c0a8c7b6c80a"),
  });
  expect(newTicket?.version).toEqual(0);
  await newTicket?.save();
  expect(newTicket?.version).toEqual(1);
  await newTicket?.save();
  expect(newTicket?.version).toEqual(2);
  newTicket?.set("price", "499");
  await newTicket?.save();
  expect(newTicket?.version).toEqual(3);
});
