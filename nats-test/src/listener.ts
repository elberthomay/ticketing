import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./TicketCreatedListener";

const onMessage = (data: any, msg: Message) => {
  console.log(`Received message #${msg.getSequence()}`, data);
  msg.ack();
};

const stan = nats.connect("ticketing", randomBytes(5).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("close", () => {
  console.log("NATS connection terminating");
  process.exit();
});

stan.on("connect", () => {
  console.log("connected to NATS");
  const listener = new TicketCreatedListener("order-group", onMessage, stan);
  listener.listen();
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
