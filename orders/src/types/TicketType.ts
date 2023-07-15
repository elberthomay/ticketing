import { TicketEventData, TicketUpdatedEvent } from "@elytickets/common";
import mongoose from "mongoose";

export interface TicketData {
  title: string;
  price: string;
}

export interface NewTicketData extends TicketData {
  id: mongoose.Types.ObjectId;
}

export interface TicketDoc extends mongoose.Document, TicketData {
  version: number;
  ownerId: string;
  isReserved(): Promise<boolean>;
}

export interface TicketModel extends mongoose.Model<TicketDoc> {
  createTicket(ticketData: NewTicketData): Promise<TicketDoc>;
  findDocumentById(id: string): Promise<TicketDoc | undefined>;
  findByIdAndVersion(eventData: TicketEventData): Promise<TicketDoc | null>;
}
