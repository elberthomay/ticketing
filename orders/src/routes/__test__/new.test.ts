import { forgeCookie } from "@elytickets/common";
import request from "supertest";
import app from "../../app";
import Ticket from "../../models/Ticket";
import { addOrder, addTickets } from "../../test/addTickets";
import { OrderStatus } from "@elytickets/common";
import { Order } from "../../models/Order";
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

defaultCookie.id = "64a75c360573b816f583f486";

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
  await addOrder(testTickets[0], defaultCookie.id, OrderStatus.created);
  await addOrder(testTickets[1], defaultCookie.id, OrderStatus.awaitingPayment);
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete);
});

it("return status code 401(unauthorized) when not logged in", async () => {
  await request(app)
    .post("/api/orders/")
    .send({ ticketId: "64a75f360533b816f583f486" })
    .expect(401);
});

it("return status code 400(bad request) with 'ticketId' as field when ticketId is invalid", async () => {
  const response = await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: "invalid" })
    .expect(400);
  const response0 = await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: "64a75f36053hb816f583f486" })
    .expect(400);
  expect(response?.body?.errors[0]?.field).toEqual("ticketId");
  expect(response0?.body?.errors[0]?.field).toEqual("ticketId");
});

it("return status code 404(not found) with 'Ticket' as field when ticketId is is not found", async () => {
  const response = await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: "64a75f36053ab816f583f486" })
    .expect(404);

  expect(response?.body?.errors[0]?.field).toEqual("Ticket");
});

it("return status code 409(conflict) when ticket had been reserved", async () => {
  //created
  await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: testTickets[0]._id })
    .expect(409);
  //awaiting-payment
  await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: testTickets[1]._id })
    .expect(409);
  //complete
  await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: testTickets[3]._id })
    .expect(409);
});

it("return status code 200(success) when ordering ticket with existing order that has been cancelled", async () => {
  //cancelled
  await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: testTickets[2]._id })
    .expect(200);
});

it("return status code 200(success) when ordering ticket with no existing order", async () => {
  const response = await request(app)
    .post("/api/orders/")
    .set("Cookie", defaultCookie())
    .send({ ticketId: testTickets[4]._id })
    .expect(200);

  const orderId = response?.body?.id;
  console.log(orderId);
  const order = await Order.findById(orderId);

  expect(order?.ownerId).toEqual(defaultCookie.id);
  expect(order?.ticket?._id.toString()).toEqual(testTickets[4]._id);

  expect(natsClient.client.publish).toHaveBeenCalled();
});
