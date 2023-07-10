import nats from "node-nats-streaming";
import TicketCreatedPublisher from "./TicketCreatedPublisher";

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("close", () => {
  console.log("NATS connection terminating");
  process.exit();
});

stan.on("connect", () => {
  console.log("publisher connected to NATS");
  const callback = () => console.log("event published");
  const data = {
    id: "123",
    title: " yeaaah",
    price: "20",
  };
  const publisher = new TicketCreatedPublisher(stan);
  publisher.publish(data, callback);
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
