import { param } from "express-validator";

export default [param("id").isMongoId()];
