import { TicketUpdateData } from "../types/TicketType";
import request from "supertest";
import app from "../app";

// Helper function to create a ticket
export async function createTicket(
  ticketData: TicketUpdateData,
  cookie: string
) {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", [cookie])
    .send(ticketData);
  return response.body.id;
}
