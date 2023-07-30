import { forgeCookie } from "@elytickets/common";
import { createTicket } from "../../test/createTicket";
import request from "supertest";
import app from "../../app";

const defaultCookie = () => [
  forgeCookie(
    {
      email: "test@test.com",
      id: "64a75c360573b816f583f486",
    },
    process.env.JWT_KEY!,
    "session"
  ),
];

const otherUser = () => [
  forgeCookie(
    {
      email: "test@test.com",
      id: "64a75c260573b816f5e3f486",
    },
    process.env.JWT_KEY!,
    "session"
  ),
];

it("return status code 401 if not logged in", async () => {
  const tickets = await createTicket(5, defaultCookie());

  const response = await request(app).get("/api/tickets/byOwner").expect(401);
});

it("return status code 200 with empty array if there's no ticket", async () => {
  const response = await request(app)
    .get("/api/tickets/byOwner")
    .set("Cookie", defaultCookie())
    .expect(200);

  expect(response.body).toEqual([]);
});

it("return status code 200 with empty array if there's no ticket created by the user", async () => {
  const tickets = await createTicket(5, defaultCookie());
  const response = await request(app)
    .get("/api/tickets/byOwner")
    .set("Cookie", otherUser())
    .expect(200);

  expect(response.body).toEqual([]);
});

it("return status code 200 with array with 5 element if there's 5 ticket created by the user", async () => {
  const tickets = await createTicket(5, defaultCookie());
  const otherTickets = await createTicket(7, otherUser());
  const response = await request(app)
    .get("/api/tickets/byOwner")
    .set("Cookie", defaultCookie())
    .expect(200);

  expect(response.body).toHaveLength(5);
});
