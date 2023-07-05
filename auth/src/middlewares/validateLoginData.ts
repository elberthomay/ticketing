import { body } from "express-validator";
export const validateLoginData = [
  body("email").isEmail().withMessage("Email is invalid"),
  body("password")
    .trim()
    .isLength({ min: 8, max: 30 })
    .withMessage("Password must be between 8 and 1024 characters"),
];
