import { Order } from "../models/Order";
import Ticket from "../models/Ticket";
import { OrderStatus } from "@elytickets/common";

export async function addTickets(tickets: any[]) {
  await Promise.all(
    tickets.map((ticket) => {
      const newTicket = new Ticket(ticket);
      return newTicket.save();
    })
  );
}

export async function addOrder(
  ticket: any,
  ownerId: string,
  status: OrderStatus
) {
  const newOrder = new Order({
    ownerId: ownerId,
    status: status,
    expiresAt: Date.now() + 15 * 60 * 1000,
    ticket: ticket._id,
  });
  await newOrder.save();
  return newOrder._id;
}
