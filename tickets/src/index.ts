import app from "./app";
import mongoose from "mongoose";

if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY is not defined in env");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in env");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to mongodb!"))
  .catch(() => console.log("mongo connection error"));

app.listen(3000, () => {
  console.log("tickets listening to port 3000");
});
