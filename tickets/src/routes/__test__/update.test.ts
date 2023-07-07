import { SessionData, forgeCookie } from "@elytickets/common";
import { TicketData, TicketUpdateData } from "../../types/TicketType";
import { createTicket } from "../../test/createTicket";
import app from "../../app";

const request = require("supertest");
const mongoose = require("mongoose");

// Mock data for testing
const userData: SessionData = {
  id: "64a7600ed9c4a15165b52e64",
  email: "test@example.com",
};

const ticketData: TicketUpdateData = {
  title: "Test Ticket",
  price: "10.99",
};

describe("Update API Route", () => {
  let ticketId: string;
  let cookie: string;

  beforeEach(async () => {
    cookie = forgeCookie(userData, process.env.JWT_KEY!, "session");
    ticketId = await createTicket(ticketData, cookie);
  });

  //   afterEach(async () => {
  //     // Clean up the created ticket after each test
  //     await request(app).delete(`/api/tickets/${ticketId}`).set("Cookie", cookie);
  //   });

  it("should return 404 when updating a nonexistent ticket", async () => {
    const response = await request(app)
      .put("/api/tickets/6443600edbc4a15161b52e64")
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "19.99",
      });

    expect(response.status).toBe(404);
  });

  it("should return 400 when updating with an invalid ID", async () => {
    await request(app)
      .put("/api/tickets/6443600edbc4a151g1b52e64")
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "19.99",
      })
      .expect(400);

    await request(app)
      .put("/api/tickets/6443600edbc4a151a1b52e644")
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "19.99",
      })
      .expect(400);

    const response = await request(app)
      .put("/api/tickets/invalid-id")
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "19.99",
      });

    expect(response.status).toBe(400);
  });

  it("should return 401 when updating a ticket with a different user", async () => {
    const anotherUserCookie = forgeCookie(
      {
        id: "64a7603ed9c4a15165b52a64",
        email: "another@example.com",
      },
      process.env.JWT_KEY!,
      "session"
    );

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", anotherUserCookie)
      .send({
        title: "Updated Ticket",
        price: "19.99",
      });

    expect(response.status).toBe(401);
  });

  it("should return 400 when updating with incomplete price data", async () => {
    await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "updated",
        price: "",
      })
      .expect(400);

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when updating with partially incomplete ticket data", async () => {
    await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "",
        price: "19.99",
      })
      .expect(400);

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        price: "19.99",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when updating with empty ticket data", async () => {
    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({});

    expect(response.status).toBe(400);
  });

  it("should return 400 when updating with a non-numeric price", async () => {
    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "invalid-price",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when updating with a negative price", async () => {
    await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "-5.0",
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "-5",
      })
      .expect(400);
  });

  it("should return 200 when updating a valid ticket with complete data", async () => {
    await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "19",
      })
      .expect(200);

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie)
      .send({
        title: "Updated Ticket",
        price: "19.99",
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Ticket");
    expect(response.body.price).toBe("19.99");
  });
});
