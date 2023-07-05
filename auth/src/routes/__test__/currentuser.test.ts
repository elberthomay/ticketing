import request from "supertest";
import app from "../../app";

it("responds with detail of the current user", async () => {
  const inputEmail = "test@test.com";
  const signupResponse = await request(app)
    .post("/api/users/signup")
    .send({
      email: inputEmail,
      password: "password",
    })
    .expect(201);

  const cookie = signupResponse.get("Set-Cookie");

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual(inputEmail);
});

it("return currentUser: null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
