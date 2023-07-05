import express, { Request, Response } from "express";
import authRoute from "./routes/authRoute";
import errorHandler from "./middlewares/error-handler";
import { NotFoundError } from "./errors/NotFoundError";
import cookieSession from "cookie-session";

const app = express();
app.set("trust proxy", true);
app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(authRoute);
app.use(() => {
  throw new NotFoundError();
});
app.use(errorHandler);

export default app;
