const request = require("supertest");
import mongoose from "mongoose";
import { SessionData, forgeCookie } from "@elytickets/common";
import { createTicket } from "../../test/createTicket";
import app from "../../app";

const userData: SessionData = {
  id: new mongoose.Types.ObjectId().toHexString(),
  email: "test@example.com",
};

// Mock data for testing
const ticketData = {
  title: "Test Ticket",
  price: "10.99",
};

describe("Show Routes", () => {
  let ticketId: string;
  let cookie: string;

  beforeEach(async () => {
    // Create a cookie for authenticated requests
    cookie = forgeCookie(userData, process.env.JWT_KEY!, "session");
  });

  //   afterEach(async () => {
  //     // Delete the created ticket after each test
  //     await request(app).delete(`/api/tickets/${ticketId}`).set("Cookie", cookie);
  //   });

  it("should retrieve an empty array when there are no tickets", async () => {
    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should retrieve an array with the added ticket", async () => {
    ticketId = await createTicket(ticketData, cookie);

    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe(ticketData.title);
    expect(response.body[0].price).toBe(ticketData.price);
  });

  it("should retrieve an array with 3 tickets", async () => {
    const ticketDatas = [
      ticketData,
      {
        title: "Test Ticket1",
        price: "34564.99",
      },
      {
        title: "not me Ticket",
        price: "6882.89",
      },
    ];
    await Promise.all(
      ticketDatas.map((ticketData) => createTicket(ticketData, cookie))
    );

    const response = await request(app).get("/api/tickets");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    ticketDatas.forEach((ticketData, index) => {
      expect(ticketData.title).toEqual(response.body[index].title);
      expect(ticketData.price).toEqual(response.body[index].price);
    });
    expect(ticketDatas.length).toEqual(3);
  });

  it("should return 400 when retrieving ticket with invalid ID", async () => {
    const response = await request(app).get("/api/tickets/invalid-id");

    expect(response.status).toBe(400);
  });

  it("should return 404 when retrieving nonexistent ticket", async () => {
    const nonexistentId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/tickets/${nonexistentId}`);

    expect(response.status).toBe(404);
  });

  it("should retrieve the ticket by ID", async () => {
    console.log(ticketData);
    const ticketId = await createTicket(ticketData, cookie);
    console.log(ticketId);
    const response = await request(app).get(`/api/tickets/${ticketId}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(ticketData.title);
    expect(response.body.price).toBe(ticketData.price);
  });
});
