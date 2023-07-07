import request from "supertest";
import app from "../../app";

it("return status code 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});

it("return status code 400 with invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "password",
    })
    .expect(400);
});

it("return status code 400 with invalid password", async () => {
  //under 8 character
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "passwor",
    })
    .expect(400);

  //over 30 character
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password12password12password123",
    })
    .expect(400);
});

it("disallow duplicate email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password123",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password12345",
    })
    .expect(400);
});

it("sets cookie after a successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password123",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
