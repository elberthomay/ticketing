import app from "./app";
import mongoose from "mongoose";

mongoose
  .connect("mongodb://auth-mongo-srv:27017/auth")
  .then(() => {
    console.log("connected to mongodb!");
  })
  .catch(() => {
    console.log("mongo connection error");
  });

if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY is not defined in env");
}

app.listen(3000, () => {
  console.log("try this");
  console.log("auth listening to port 3000");
});
