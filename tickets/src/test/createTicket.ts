import { TicketUpdateData } from "@elytickets/common";
import request from "supertest";
import app from "../app";
import { faker } from "@faker-js/faker";

// Override
export async function createTicket(
  ticketData: number,
  cookie: string | string[]
): Promise<{ id: string; data: TicketUpdateData }[]>;

export async function createTicket(
  ticketData: TicketUpdateData,
  cookie: string | string[]
): Promise<string>;

// Helper function to create a ticket
//receive ticketData: TicketUpdateData | number
// if TicketUpdateData: create a ticket with the provided data. return id of the created tickets
// else if number: create a number of ticket with randomized data.
// return array
export async function createTicket(
  ticketData: TicketUpdateData | number,
  cookie: string | string[]
): Promise<string | { id: string; data: TicketUpdateData }[]> {
  const cookieData: string[] = typeof cookie === "string" ? [cookie] : cookie;
  // Utility function to generate a single ticket data
  const generateTicketData = (): TicketUpdateData => ({
    title: faker.commerce.productName(),
    price: faker.commerce.price({ min: 0, max: 99999 }),
  });

  // If ticketData is a number, generate multiple tickets
  if (typeof ticketData === "number") {
    const ticketsData = Array.from({ length: ticketData }, generateTicketData);

    const ticketsPromises = ticketsData.map(async (data) => {
      const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookieData)
        .send(data);

      return { id: response.body.id, data };
    });

    return await Promise.all(ticketsPromises);
  } else {
    // If ticketData is a single object, create a single ticket
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookieData)
      .send(ticketData);

    return response.body.id;
  }
}
