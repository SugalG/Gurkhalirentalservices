import { Document, InferSchemaType, Schema, Types, model } from "mongoose";

export const MAX_NAME_LENGTH = 100;
export const MAX_PHONE_NUMBER_LENGTH = 20;

export const clientDetailSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
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
      // unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_PHONE_NUMBER_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

export type ClientDetail = InferSchemaType<typeof clientDetailSchema> & {
  _id: Types.ObjectId;
};
export type ClientDetailDocument = ClientDetail & Document;
export const ClientDetailModel = model<ClientDetailDocument>(
  "client-details",
  clientDetailSchema
);
