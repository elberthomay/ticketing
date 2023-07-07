import mongoose from "mongoose";
import { DatabaseError } from "@elytickets/common";
import { TicketData, TicketDoc, TicketModel } from "../types/TicketType";

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
    sellerId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

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

ticketModel.statics.findTicketsBySellerId = async (
  sellerId: string
): Promise<TicketDoc[] | undefined> => {
  try {
    const tickets = Ticket.find({ sellerId });
    return tickets;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketModel.statics.findTicketById = async (
  id: string
): Promise<TicketDoc | null | undefined> => {
  try {
    const ticket = Ticket.findById(id);
    return ticket;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketModel.statics.findAll = async (): Promise<TicketDoc[] | undefined> => {
  try {
    const tickets = Ticket.find({});
    return tickets;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketModel);

export default Ticket;
