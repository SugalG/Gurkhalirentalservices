import { InferSchemaType, Schema, Types, model, Document } from "mongoose";
import { MAX_NAME_LENGTH } from "./client-details.model";

export const MAX_SUBJECT_LENGTH = 512;
export const MAX_MESSAGE_LENGTH = 4096;

const supportContactSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_NAME_LENGTH,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_SUBJECT_LENGTH,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_MESSAGE_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

export type SupportContact = InferSchemaType<typeof supportContactSchema> & {
  _id: Types.ObjectId;
};
export type SupportContactDocument = SupportContact & Document;
export const SupportContactModel = model(
  "support-contact",
  supportContactSchema
);
