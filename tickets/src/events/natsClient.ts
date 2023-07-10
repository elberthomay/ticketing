import nats, { Stan } from "node-nats-streaming";
class NatsClient {
  private _client?: Stan;
  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client = nats.connect(clusterId, clientId, {
        url: url,
      });

      this.client.on("connect", () => {
        console.log("NATS is connected");
        resolve();
      });

      this.client.on("error", (err) => reject(err));
    });
  }

  get client() {
    if (this._client) return this._client;
    else throw new Error("nats client is undefined");
  }

  close() {
    if (this.client) this.client.close();
  }
  // close() {
  //   if (this.client) {
  //     const closePromise = () => {
  //       return new Promise<void>((resolve, reject) => {
  //         this.client.on("close", () => {
  //           console.log("NATS connection closed");
  //           resolve();
  //         });
  //         this.client.close();
  //       });
  //     };
  //     return closePromise();
  //   } else return Promise.resolve();
  // }
}

export default new NatsClient();
