import mongoose from "mongoose";
import { Ticket } from "../Ticket";
import { DatabaseError, DocumentNotFoundError } from "@elytickets/common";

const ownerId = "ac9643acfe08c0a8c7b6c80a";

it("throws an error when updating modified entry ", async () => {
  //create new ticket
  const newTicket = await Ticket.createTicket({
    title: "no",
    price: "53555",
    ownerId: ownerId,
  });

  //fetch the created ticket
  const fetchedTicket = await Ticket.findDocumentById(newTicket?._id);

  //update ticket once
  newTicket?.set("price", "645675");
  await newTicket?.save();

  //update for the second time
  await expect(async () => {
    fetchedTicket?.set("title", "blue");
    await fetchedTicket?.save();
  }).rejects.toThrowError();
});

it("increments version correctly", async () => {
  //create new ticket
  const newTicket = await Ticket.createTicket({
    title: "no",
    price: "53555",
    ownerId: ownerId,
  });
  expect(newTicket?.version).toEqual(0);

  //save one time
  await newTicket?.save();
  expect(newTicket?.version).toEqual(1);

  //save second time
  await newTicket?.save();
  expect(newTicket?.version).toEqual(2);

  //save third time
  newTicket?.set("price", "499");
  await newTicket?.save();
  expect(newTicket?.version).toEqual(3);
});
