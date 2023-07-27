import { forgeCookie } from "@elytickets/common";
import request from "supertest";
import app from "../../app";
import { OrderStatus } from "@elytickets/common";
import Order from "../../models/Order";
import natsClient from "../../events/natsClient";
import { addOrder } from "../../test/addTickets";
import mongoose, { ObjectId } from "mongoose";
import stripe from "../../stripe";
import { ChargeData } from "@elytickets/common";
import { Charge } from "../../models/Charge";

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

const token = "tok_visa";

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

const setup = async () => {
  const orderIdList: mongoose.Types.ObjectId[] = [];
  orderIdList.push(
    await addOrder(testTickets[0], defaultCookie.id, OrderStatus.created)
  );
  orderIdList.push(
    await addOrder(
      testTickets[1],
      defaultCookie.id,
      OrderStatus.awaitingPayment
    )
  );
  orderIdList.push(
    await addOrder(testTickets[2], defaultCookie.id, OrderStatus.cancelled)
  );
  orderIdList.push(
    await addOrder(testTickets[3], defaultCookie.id, OrderStatus.complete)
  );
  return orderIdList;
};

it("return status code 401(unauthorized) when not logged in", async () => {
  const orderIdList = await setup();

  await request(app)
    .post("/api/payments/")
    .send({ orderId: orderIdList[0], token })
    .expect(401);
});

it("return status code 401(unauthorized) when logged in as different user", async () => {
  const orderIdList = await setup();

  await request(app)
    .post("/api/payments/")
    .set("Cookie", otherUser())
    .send({ orderId: orderIdList[1], token })
    .expect(401);
});

it("return status code 400(bad request) with 'orderId' as field when orderId is invalid", async () => {
  const orderIdList = await setup();

  const response = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: "invalid", token })
    .expect(400);

  //non hex
  const response0 = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: "62ab5c8809e4b816faa3h03c", token })
    .expect(400);

  expect(response?.body?.errors[0]?.field).toEqual("orderId");
  expect(response0?.body?.errors[0]?.field).toEqual("orderId");
});

it("return status code 400(bad request) with 'token' as field when token not provided", async () => {
  const orderIdList = await setup();

  const response = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[1] })
    .expect(400);

  //empty
  const response0 = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({
      orderId: orderIdList[1],
      token: "",
    })
    .expect(400);

  expect(response?.body?.errors[0]?.field).toEqual("token");
  expect(response0?.body?.errors[0]?.field).toEqual("token");
});

it("return status code 404(not found) with 'Order' as field when orderId is is not found", async () => {
  const response = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: "64a75f36053ab816f583f486", token })
    .expect(404);

  expect(response?.body?.errors[0]?.field).toEqual("Order");
});

it("return status code 409(conflict) when order status is not Awaiting:payment ", async () => {
  const orderIdList = await setup();

  //created
  await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[0], token })
    .expect(409);
  //cancelled
  await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[2], token })
    .expect(409);
  //complete
  await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[3], token })
    .expect(409);
});

it("return status code 201(created) when creating charge on valid order", async () => {
  const orderIdList = await setup();

  const result = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[1], token })
    .expect(201);

  expect(natsClient.client.publish).toHaveBeenCalled();
  const paymentData: ChargeData = result.body;

  //check db
  const chargeDoc = await Charge.findDocumentById(paymentData.id);

  expect(chargeDoc?.orderId).toEqual(orderIdList[1].toHexString());
  expect(chargeDoc?.amount).toEqual(
    Math.round(parseFloat(testTickets[1].price) * 100)
  );

  //retrieve charge from stripe
  const charge = await stripe.charges.retrieve(paymentData.chargeId);
  expect(charge.currency).toEqual("usd");
  expect(charge.amount).toEqual(
    Math.round(parseFloat(testTickets[1].price) * 100)
  );
});

it("return status code 200(success) when charge has been made", async () => {
  const orderIdList = await setup();

  const result = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[1], token })
    .expect(201);

  await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[1], token })
    .expect(200);

  expect(natsClient.client.publish).toHaveBeenCalledTimes(1);
});

it("return status code 200(success) when charge has been made and order status changed to complete", async () => {
  const orderIdList = await setup();

  const result = await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[1], token })
    .expect(201);

  const order = await Order.findById(orderIdList[1]);
  order?.set("status", OrderStatus.complete);
  await order?.save();

  await request(app)
    .post("/api/payments/")
    .set("Cookie", defaultCookie())
    .send({ orderId: orderIdList[1], token })
    .expect(200);

  expect(natsClient.client.publish).toHaveBeenCalledTimes(1);
});
