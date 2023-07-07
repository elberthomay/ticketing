import mongoose from "mongoose";

export interface TicketUpdateData {
  title: string;
  price: string;
}

export interface TicketData {
  title: string;
  price: string;
  sellerId: mongoose.Types.ObjectId;
}

export interface TicketDoc extends mongoose.Document, TicketData {}

export interface TicketModel extends mongoose.Model<TicketDoc> {
  createUser(attrs: TicketData): Promise<TicketDoc | undefined>;
  findTicketsBySellerId(sellerId: string): Promise<TicketDoc[] | undefined>;
  findTicketById(id: string): Promise<TicketDoc | null | undefined>;
  findAll(): Promise<TicketDoc[] | undefined>;
}
