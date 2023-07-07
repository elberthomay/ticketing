import express from "express";
import cookieSession from "cookie-session";
import { NotFoundError, errorHandler } from "@elytickets/common";
import ticketRouter from "./routes/ticketsRoute";

const app = express();

app.set("trust proxy", true);

app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(ticketRouter);

app.use(() => {
  throw new NotFoundError();
});

app.use(errorHandler);

export default app;
