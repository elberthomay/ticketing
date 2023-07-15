import mongoose from "mongoose";

export interface TicketUpdateData {
  title: string;
  price: string;
}

export interface TicketData {
  title: string;
  price: string;
  ownerId: mongoose.Types.ObjectId;
}

export interface TicketDoc extends mongoose.Document, TicketData {
  version: number;
}

export interface TicketModel extends mongoose.Model<TicketDoc> {
  createTicket(attrs: TicketData): Promise<TicketDoc | undefined>;
  findTicketsByOwnerId(ownerId: string): Promise<TicketDoc[] | undefined>;
  findDocumentById(id: string): Promise<TicketDoc | undefined>;
  findAll(): Promise<TicketDoc[] | undefined>;
}
