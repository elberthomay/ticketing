import { Stan } from "node-nats-streaming";
import { Event } from "./types/EventTypes";
export default abstract class AbstractPublisher<T extends Event> {
  abstract subject: T["subject"];
  private client: Stan;
  constructor(client: Stan) {
    this.client = client;
  }
  serializeMessage(data: T["data"]) {
    return JSON.stringify(data);
  }

  publish(data: T["data"], callback?: () => void) {
    return new Promise<string>((resolve, reject) => {
      const id = this.client.publish(
        this.subject,
        this.serializeMessage(data),
        (err) => {
          if (err) reject(err);
          if (callback) callback();
        }
      );
      resolve(id);
    });
  }
}
