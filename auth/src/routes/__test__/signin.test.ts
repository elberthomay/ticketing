import request from "supertest";
import app from "../../app";
import signin from "../../test/signin";

it("return status code 200 on successful signin", async () => {
  await signin();
});

it("return a cookie on successful signin", async () => {
  const cookie = await signin();
  expect(cookie).toBeDefined();
});

it("return status code 400 on wrong user name or password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.co",
      password: "password",
    })
    .expect(400);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "passworddfdf",
    })
    .expect(400);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@tet.com",
      password: "passworddfdf",
    })
    .expect(400);
});
