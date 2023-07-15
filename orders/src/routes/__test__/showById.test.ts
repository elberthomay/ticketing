import { forgeCookie } from "@elytickets/common";
import request from "supertest";
import app from "../../app";
import Ticket from "../../models/Ticket";
import { addOrder, addTickets } from "../../test/addTickets";
import { OrderStatus } from "@elytickets/common";
import mongoose from "mongoose";

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

defaultCookie.id = "64a75c360573b816f583f486";
otherUser.id = "64a75c260573b816f5e3f486";

const testTickets = [
  {
    _id: "64a75c360973b816f5a3f486",
    title: "disney land",
    price: "12345",
  },
  {
    _id: "62a75c380973b816f5a3f436",
    title: "toony land",
    price: "53226.344",
  },
  {
    _id: "62ab5c880973b816faa3f436",
    title: "Hell on Earth",
    price: "5.4",
  },
  {
    _id: "62ab5c8809e3b816faa3f036",
    title: "Heaven on Earth",
    price: "10.5",
  },
  {
    _id: "62ab5c8809e4b816faa3f03c",
    title: "Blue Ball",
    price: "999",
  },
];

beforeEach(async () => {
  await addTickets(testTickets);
});

it("return status code 401(unauthorized) when not logged in", async () => {
  await request(app).get("/api/orders/invalidId").send().expect(401);
});

it("return status code 400(bad request) when id is invalid", async () => {
  const response = await request(app)
    .get("/api/orders/invalidId")
    .set("Cookie", defaultCookie())
    .send()
    .expect(400);
});

it("return status code 401(unauthorized) when order id is owned by other user", async () => {
  const orderId = await addOrder(
    testTickets[0],
    defaultCookie.id,
    OrderStatus.created
  );
  const response = await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", otherUser())
    .send()
    .expect(401);
});

it("return status code 404(not found) with 'Order' as field when order is not found", async () => {
  const response = await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(404);

  expect(response?.body?.errors[0]?.field).toEqual("Order");
});

it("return status code 200(success) when order id is correct", async () => {
  const orderId = await addOrder(
    testTickets[0],
    defaultCookie.id,
    OrderStatus.created
  );

  const response = await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response?.body?.ownerId).toEqual(defaultCookie.id);
  expect(response?.body?.ticket?.id).toEqual(testTickets[0]._id);
  expect(response?.body?.status).toEqual(OrderStatus.created);

  const orderId1 = await addOrder(
    testTickets[1],
    otherUser.id,
    OrderStatus.complete
  );
  const response1 = await request(app)
    .get(`/api/orders/${orderId1}`)
    .set("Cookie", otherUser())
    .send()
    .expect(200);

  expect(response1?.body?.ownerId).toEqual(otherUser.id);
  expect(response1?.body?.ticket?.id).toEqual(testTickets[1]._id);
  expect(response1?.body?.status).toEqual(OrderStatus.complete);
});
