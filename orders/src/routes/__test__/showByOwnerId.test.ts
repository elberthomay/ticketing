import { forgeCookie } from "@elytickets/common";
import request from "supertest";
import app from "../../app";
import { addOrder, addTickets } from "../../test/addTickets";
import { OrderStatus } from "@elytickets/common";
import { Order } from "../../models/Order";

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

const createOrders = async () => {
  await addOrder(testTickets[0], defaultCookie.id, OrderStatus.created);
  await addOrder(testTickets[1], defaultCookie.id, OrderStatus.awaitingPayment);
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], otherUser.id, OrderStatus.complete);
  await addOrder(testTickets[4], otherUser.id, OrderStatus.complete);
};

it("return status code 401(unauthorized) when not logged in", async () => {
  await request(app).get("/api/orders/").send().expect(401);
});

it("return status code 200(success) with empty array when no order is submitted", async () => {
  const response = await request(app)
    .get("/api/orders/")
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response?.body).toEqual([]);
});

it("return status code 200(success) with empty array when completed or cancelled order exist in database", async () => {
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete);
  await addOrder(testTickets[4], defaultCookie.id, OrderStatus.complete);
  const response = await request(app)
    .get("/api/orders/")
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response?.body).toEqual([]);
});

it("return status code 200(success) with array with 1 element when 1 active order exist in database", async () => {
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete);
  await addOrder(testTickets[4], defaultCookie.id, OrderStatus.created);
  const response = await request(app)
    .get("/api/orders/")
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response?.body).toHaveLength(1);
  console.log(response?.body);
  expect(response?.body[0].ticket.id).toEqual(testTickets[4]._id);
  expect(response?.body[0].ownerId).toEqual(defaultCookie.id);
  expect(response?.body[0].status).toEqual(OrderStatus.created);
});

it("return status code 200(success) with array with 1 element when 1 active order for current user exist in database", async () => {
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete);
  await addOrder(testTickets[4], defaultCookie.id, OrderStatus.created);
  await addOrder(testTickets[1], otherUser.id, OrderStatus.created);
  await addOrder(testTickets[0], otherUser.id, OrderStatus.created);
  await addOrder(testTickets[2], otherUser.id, OrderStatus.complete);
  const response = await request(app)
    .get("/api/orders/")
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response?.body).toHaveLength(1);
  expect(response?.body[0].ticket.id).toEqual(testTickets[4]._id);
  expect(response?.body[0].ownerId).toEqual(defaultCookie.id);
  expect(response?.body[0].status).toEqual(OrderStatus.created);
});

it("return status code 200(success) with array with 3 element when 3 active order for current user exist in database", async () => {
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete);
  await addOrder(testTickets[4], defaultCookie.id, OrderStatus.created);
  await addOrder(testTickets[1], otherUser.id, OrderStatus.created);
  await addOrder(testTickets[0], otherUser.id, OrderStatus.cancelled);
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.awaitingPayment);
  await addOrder(testTickets[0], defaultCookie.id, OrderStatus.created);
  const response = await request(app)
    .get("/api/orders/")
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response?.body).toHaveLength(3);
  // expect(response?.body[0].ticket.id).toEqual(testTickets[4]._id);
  // expect(response?.body[0].ownerId).toEqual(defaultCookie.id);
  // expect(response?.body[0].status).toEqual(OrderStatus.created);
});
