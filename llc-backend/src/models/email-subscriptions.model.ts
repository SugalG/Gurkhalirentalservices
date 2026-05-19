import { InferSchemaType, Schema, Types, model, Document } from "mongoose";

const emailSubscriptionSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export type EmailSubscription = InferSchemaType<
  typeof emailSubscriptionSchema
> & {
  _id: Types.ObjectId;
};
export type EmailSubscriptionDocument = EmailSubscription & Document;
export const EmailSubscriptionModel = model(
  "email-subscriptions",
  emailSubscriptionSchema
);
