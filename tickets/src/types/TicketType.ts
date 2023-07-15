import mongoose from "mongoose";

export type TicketUpdateData = Pick<TicketDoc, "title" | "price">;
export type TicketCreateData = Pick<TicketDoc, "title" | "price" | "ownerId">;

export interface TicketData {
  title: string;
  price: string;
  ownerId: string;
  version: number;
  orderId: string | null;
}

export interface TicketDoc extends mongoose.Document, TicketData {}

export interface TicketModel extends mongoose.Model<TicketDoc> {
  createTicket(attrs: TicketCreateData): Promise<TicketDoc | undefined>;
  findTicketsByOwnerId(ownerId: string): Promise<TicketDoc[] | undefined>;
  findDocumentById(id: string): Promise<TicketDoc | undefined>;
  findAll(): Promise<TicketDoc[] | undefined>;
}
