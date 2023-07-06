import mongoose from "mongoose";
import { DatabaseError } from "@elytickets/common";
import { UserData, UserDoc, UserModel } from "../types/UserType";
import { Password } from "../services/Password";

const userModel = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userModel.statics.createUser = async (
  attrs: UserData
): Promise<UserDoc | undefined> => {
  try {
    const newUser = new User(attrs);
    await newUser.save();
    return newUser;
  } catch (err: unknown) {
    if (err instanceof Error) throw new DatabaseError(err.message);
  }
};

userModel.pre("save", async function (done) {
  const { password } = this;
  const hashSaltPair = await Password.toHash(password);
  this.password = hashSaltPair;
  done();
});

export const User = mongoose.model<UserDoc, UserModel>("User", userModel);
