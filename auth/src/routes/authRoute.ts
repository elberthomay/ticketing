import express, { NextFunction, Request, Response } from "express";

import { checkValidationError } from "@elytickets/common";
import { authenticateUser } from "../middlewares/authenticateUser";
import { validateLoginData } from "../middlewares/validateLoginData";
import { fetchUser } from "../middlewares/fetchUser";
import { createUser } from "../middlewares/createUser";
import { createWebToken } from "../middlewares/createWebToken";

import { verifyAuth } from "@elytickets/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  validateLoginData,
  checkValidationError,
  fetchUser,
  createUser,
  createWebToken,
  (req: Request, res: Response, next: NextFunction) => {
    const { user } = req.body;
    res.status(201).json(user);
  }
);

router.post(
  "/api/users/signin",
  validateLoginData,
  checkValidationError,
  fetchUser,
  authenticateUser,
  createWebToken,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: "auth success" });
  }
);
router.get("/api/users/signout", (req: Request, res: Response) => {
  req.session = null;
  res.json({});
});
router.get(
  "/api/users/currentuser",
  verifyAuth,
  (req: Request, res: Response) => {
    res.json({ currentUser: req.currentUser || null });
  }
);

export default router;
