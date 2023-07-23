import { forgeCookie } from "@elytickets/common";
import request from "supertest";
import app from "../../app";
import { addOrder, addTickets } from "../../test/addTickets";
import { OrderStatus } from "@elytickets/common";
import mongoose from "mongoose";
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
  await request(app)
    .delete(`/api/orders/${testTickets[0]._id}`)
    .send()
    .expect(401);
});

it("return status code 400(bad request) when id is invalid", async () => {
  await request(app)
    .delete(`/api/orders/invalidId`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(400);
  await request(app)
    .delete(`/api/orders/"62ab5c8809e4b816faa3j03ck"`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(400);
});

it("return status code 404(not found) with 'Order' as field when order is not found", async () => {
  const response = await request(app)
    .delete(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(404);

  expect(response?.body?.errors[0]?.field).toEqual("Order");
});

it("return status code 401(unauthorized) when logged in as other user", async () => {
  const orderId = await addOrder(
    testTickets[2],
    defaultCookie.id,
    OrderStatus.created
  );
  const response = await request(app)
    .delete(`/api/orders/${orderId}`)
    .set("Cookie", otherUser())
    .send()
    .expect(401);
});

it("return status code 405(invalid method) when cancelling completed order", async () => {
  await addOrder(testTickets[0], defaultCookie.id, OrderStatus.created);
  await addOrder(testTickets[1], defaultCookie.id, OrderStatus.awaitingPayment);
  const cancelledOrderId = await addOrder(
    testTickets[2],
    defaultCookie.id,
    OrderStatus.cancelled
  );
  const completedOrderId = await addOrder(
    testTickets[3],
    defaultCookie.id,
    OrderStatus.complete
  );
  //   await request(app)
  //     .delete(`/api/orders/${cancelledOrderId}`)
  //     .set("Cookie", defaultCookie())
  //     .send()
  //     .expect(405);

  await request(app)
    .delete(`/api/orders/${completedOrderId}`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(405);
});

it("return status code 200(success) when cancelling order with created or awaiting payment status", async () => {
  const createdOrderId = await addOrder(
    testTickets[0],
    defaultCookie.id,
    OrderStatus.created
  );
  const awaitingPaymentOrderId = await addOrder(
    testTickets[1],
    defaultCookie.id,
    OrderStatus.awaitingPayment
  );
  await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled);
  await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete);

  const response0 = await request(app)
    .delete(`/api/orders/${createdOrderId}`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  const response1 = await request(app)
    .delete(`/api/orders/${awaitingPaymentOrderId}`)
    .set("Cookie", defaultCookie())
    .send()
    .expect(200);

  expect(response0?.body?.status).toEqual(OrderStatus.cancelled);
  expect(response1?.body?.status).toEqual(OrderStatus.cancelled);
  const order0 = await Order.findDocumentById(createdOrderId);
  const order1 = await Order.findDocumentById(awaitingPaymentOrderId);

  expect(order0?.status).toEqual(OrderStatus.cancelled);
  expect(order1?.status).toEqual(OrderStatus.cancelled);
  expect(natsClient.client.publish).toHaveBeenCalledTimes(2);
});
