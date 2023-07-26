import { DatabaseError, DocumentNotFoundError } from "@elytickets/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import {
  PaymentStatus,
  ChargeCreateData,
  ChargeDoc,
  ChargeModel,
} from "@elytickets/common";

const chargeSchema = new mongoose.Schema(
  {
    chargeId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      default: PaymentStatus.charged,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

chargeSchema.set("versionKey", "version");
chargeSchema.plugin(updateIfCurrentPlugin);

chargeSchema.statics.createCharge = async (
  newChargeData: ChargeCreateData
): Promise<ChargeDoc | undefined> => {
  try {
    const newCharge = new Charge(newChargeData);
    await newCharge.save();
    return newCharge;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

chargeSchema.statics.findDocumentById = async (
  id: string
): Promise<ChargeDoc | undefined> => {
  try {
    const charge = await Charge.findById(id);
    if (!charge) throw new DocumentNotFoundError("Charge");
    return charge;
  } catch (err: unknown) {
    if (err instanceof DocumentNotFoundError) throw err;
    else if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

chargeSchema.statics.findByOrderId = async (
  orderId: string
): Promise<ChargeDoc | undefined> => {
  try {
    const charge = await Charge.findOne({ orderId });
    if (!charge) return undefined;
    return charge;
  } catch (err) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

chargeSchema.statics.refundCharge = async (
  id: string
): Promise<ChargeDoc | undefined> => {
  try {
    const charge = await Charge.findDocumentById(id);
    if (charge?.status === PaymentStatus.refunded)
      throw new Error("Charge has been refunded");
    charge?.set("status", PaymentStatus.refunded);
    await charge?.save();
    return charge;
  } catch (err: unknown) {
    if (err instanceof DocumentNotFoundError) throw err;
    else if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

export const Charge = mongoose.model<ChargeDoc, ChargeModel>(
  "Charge",
  chargeSchema
);
