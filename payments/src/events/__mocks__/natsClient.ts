class NatsClient {
  client = {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, message: string, callback: () => void) => {
          callback();
          return "fakeId";
        }
      ),
  };
}

export default new NatsClient();
