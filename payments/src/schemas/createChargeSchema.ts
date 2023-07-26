import Joi from "joi";

const createChargeSchema = Joi.object({
  orderId: Joi.string().length(24).hex().required(),
  token: Joi.string().required(),
})
  .required()
  .unknown(false);

export default createChargeSchema;
