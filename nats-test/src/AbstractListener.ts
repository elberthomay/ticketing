import nats, { Message, Stan } from "node-nats-streaming";
import { Event } from "./types/EventTypes";
export default abstract class AbstractListener<T extends Event> {
  abstract subject: T["subject"];
  abstract onMessage: (event: T["data"], msg: Message) => void;
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait = 5 * 1000;
  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  parseMessage(msg: Message): T["data"] {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf-8"));
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );
    subscription.on("message", (msg: Message) => {
      this.onMessage(this.parseMessage(msg), msg);
    });
  }
}
