import mongoose from "mongoose";

export interface UserData {
  email: string;
  password: string;
}

export interface UserPayload {
  id: string;
  email: string;
}

export interface UserDoc extends mongoose.Document, UserData {}

export interface UserModel extends mongoose.Model<UserDoc> {
  createUser(attrs: UserData): Promise<UserDoc | undefined>;
}
