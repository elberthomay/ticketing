import { Message } from "node-nats-streaming";

export enum Subjects {
  ticketCreated = "ticket:created",
  orderCreated = "order:created",
}

export interface TicketEventData {
  id: string;
  title: string;
  price: string;
}

export interface OrderEventData {
  id: string;
  sellerId: string;
  buyerId: string;
}

export interface Event {
  subject: Subjects;
  data: any;
}

export interface TicketCreatedEvent {
  subject: Subjects.ticketCreated;
  data: TicketEventData;
}

export interface OrderCreatedEvent {
  subject: Subjects.orderCreated;
  data: OrderEventData;
}
