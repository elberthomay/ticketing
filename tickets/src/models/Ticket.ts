import mongoose from "mongoose";
import { DatabaseError, DocumentNotFoundError } from "@elytickets/common";
import { TicketData, TicketDoc, TicketModel } from "../types/TicketType";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

const ticketModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    orderId: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketModel.set("versionKey", "version");
ticketModel.plugin(updateIfCurrentPlugin);

ticketModel.statics.createTicket = async (
  attrs: TicketData
): Promise<TicketDoc | undefined> => {
  try {
    const newTicket = new Ticket(attrs);
    await newTicket.save();
    return newTicket;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketModel.statics.findTicketsByOwnerId = async (
  ownerId: string
): Promise<TicketDoc[] | undefined> => {
  try {
    const tickets = await Ticket.find({ ownerId });
    return tickets;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketModel.statics.findDocumentById = async (
  id: string
): Promise<TicketDoc | undefined> => {
  try {
    const ticket = await Ticket.findById(id);
    if (ticket === null) throw new DocumentNotFoundError("Ticket");
    return ticket;
  } catch (err: unknown) {
    if (err instanceof DocumentNotFoundError) throw err;
    else if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketModel.statics.findAll = async (): Promise<TicketDoc[] | undefined> => {
  try {
    const tickets = await Ticket.find({});
    return tickets;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
  "Ticket",
  ticketModel
);
