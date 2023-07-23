import mongoose from "mongoose";
import {
  OrderTicketCreateData,
  OrderTicketDoc,
  OrderTicketModel,
} from "@elytickets/common";
import {
  DatabaseError,
  DocumentNotFoundError,
  TicketEventData,
} from "@elytickets/common";
import { Order } from "./Order";
import { OrderStatus } from "@elytickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import _ from "lodash";

const decrementVersion = (version: number) => version - 1;

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
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

ticketSchema.set("versionKey", "version");
// ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.pre("save", function (next) {
  this.$where = {
    //ts-ignore
    version: decrementVersion(this.get("version")),
  };
  next();
});

ticketSchema.statics.createTicket = async (
  ticketData: OrderTicketCreateData
): Promise<OrderTicketDoc | undefined> => {
  try {
    const newTicket = new Ticket({
      ..._.pick(ticketData, ["title", "price"]),
      _id: ticketData.id,
    });
    await newTicket.save();
    return newTicket;
  } catch (err) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketSchema.statics.findDocumentById = async (
  id: string
): Promise<OrderTicketDoc | undefined> => {
  try {
    const ticket = await Ticket.findById(id);
    if (ticket === null) throw new DocumentNotFoundError("Ticket");
    else return ticket;
  } catch (err: unknown) {
    if (err instanceof DocumentNotFoundError) throw err;
    else if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

ticketSchema.statics.findByIdAndVersion = async (
  eventData: TicketEventData
): Promise<OrderTicketDoc | null> => {
  const ticket = await Ticket.findOne({
    _id: eventData.id,
    version: decrementVersion(eventData.version),
  });
  return ticket;
};

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const existingOrder = await Order.findOne({
    "ticket.id": this._id.toHexString(),
    status: { $ne: OrderStatus.cancelled },
  });
  return !!existingOrder;
};

const Ticket = mongoose.model<OrderTicketDoc, OrderTicketModel>(
  "Ticket",
  ticketSchema
);

export default Ticket;
