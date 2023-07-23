import { TicketUpdateData } from "@elytickets/common";
import request from "supertest";
import app from "../app";

// Helper function to create a ticket
export async function createTicket(
  ticketData: TicketUpdateData,
  cookie: string
): Promise<string> {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", [cookie])
    .send(ticketData);
  return response.body.id;
}
