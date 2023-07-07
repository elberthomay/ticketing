import { body } from "express-validator";
export default [
  body("title").isString().notEmpty().withMessage("Title must not be empty"),
  body("price")
    .isFloat({ gt: 0 })
    .notEmpty()
    .withMessage("Price must be a number"),
];
