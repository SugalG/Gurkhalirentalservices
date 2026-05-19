import { InferSchemaType, Schema, Types, model, Document } from "mongoose";

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 71; // max bytes for bcrypt input = 72 bytes

// assume all the users to be admin for now
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minLength: MIN_USERNAME_LENGTH,
      maxLength: MAX_USERNAME_LENGTH,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: MIN_PASSWORD_LENGTH,
      maxLength: MAX_PASSWORD_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

export type User = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};
export type UserDocument = User & Document;
export const UserModel = model("user", userSchema);
