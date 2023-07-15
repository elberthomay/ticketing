import { body } from "express-validator";

export default [
  body("ticketId").isMongoId().notEmpty().withMessage("ticketId is required"),
];
