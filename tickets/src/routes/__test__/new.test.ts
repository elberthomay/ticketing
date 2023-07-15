import request from "supertest";
import app from "../../app";
import { forgeCookie } from "@elytickets/common";
import { TicketUpdateData } from "../../types/TicketType";
import { createTicket } from "../../test/createTicket";

import natsClient from "../../events/natsClient";

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

it("has a route app listening to POST /api/tickets/", async () => {
  const response = await request(app).post("/api/tickets/").send({});
  expect(response.status).not.toEqual(404);
});

it("return 401: not authorized if not logged in", async () => {
  return request(app).post("/api/tickets/").send({}).expect(401);
});

it("doesn't return 401 if logged in", async () => {
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", defaultCookie())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("return 400 with validation error for missing title and/or price", async () => {
  await request(app)
    .post("/api/tickets/")
    .send({})
    .set("Cookie", defaultCookie())
    .expect(400);

  await request(app)
    .post("/api/tickets/")
    .send({ title: "blue" })
    .set("Cookie", defaultCookie())
    .expect(400);

  return request(app)
    .post("/api/tickets/")
    .send({ price: "123" })
    .set("Cookie", defaultCookie())
    .expect(400);
});

it("return 400 for request with non numeric price", async () => {
  return request(app)
    .post("/api/tickets/")
    .send({ title: "blue bar", price: "v12" })
    .set("Cookie", defaultCookie())
    .expect(400);
});

it("return 201 with valid data", async () => {
  const data: TicketUpdateData = { title: "blue bar", price: "1560.3894" };
  const response = await request(app)
    .post("/api/tickets/")
    .send(data)
    .set("Cookie", defaultCookie())
    .expect(201);

  expect(response.body.title).toEqual(data.title);
  expect(response.body.price).toEqual(data.price);

  return request(app)
    .post("/api/tickets/")
    .send({ title: "blue bar", price: "1560" })
    .set("Cookie", defaultCookie())
    .expect(201);
});

it("returns correct data when fetching data using id", async () => {
  const data: TicketUpdateData = { title: "blue bar", price: "1560.3894" };
  const ticketId = await createTicket(data, defaultCookie()[0]);
  const response = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .set("Cookie", defaultCookie())
    .expect(200);

  expect(response.body.title).toEqual(data.title);
  expect(response.body.price).toEqual(data.price);
});

it("publish an event when new ticket is successfully created", async () => {
  const data: TicketUpdateData = { title: "blue bar", price: "1560.3894" };
  const ticketId = await createTicket(data, defaultCookie()[0]);

  expect(natsClient.client.publish).toHaveBeenCalled();
});

it("publish an event when new ticket is successfully created", async () => {
  const data: TicketUpdateData = { title: "blue bar", price: "1560.3894" };
  await createTicket(data, defaultCookie()[0]);
  await createTicket(data, defaultCookie()[0]);
  await createTicket(data, defaultCookie()[0]);

  expect(natsClient.client.publish).toHaveBeenCalledTimes(3);
});
