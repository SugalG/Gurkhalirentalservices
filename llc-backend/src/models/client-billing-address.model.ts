import { InferSchemaType, Schema, Types, model, Document } from "mongoose";
import { ClientDetailModel, MAX_NAME_LENGTH } from "./client-details.model";

export const MAX_ADDRESS_LENGTH = 256;
export const MAX_ADDRESS_LINE_LENGTH = 1024;
export const MAX_POSTAL_CODE_LENGTH = 20;

export const clientBillingAddressSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
    clientDetail: {
      type: Schema.Types.ObjectId,
      ref: ClientDetailModel,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_NAME_LENGTH,
    },
    affiliation: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_NAME_LENGTH,
    },
    addressLine_1: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_ADDRESS_LINE_LENGTH,
    },
    addressLine_2: {
      type: String,
      required: false,
      trim: true,
      maxLength: MAX_ADDRESS_LINE_LENGTH,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_ADDRESS_LENGTH,
    },
    state: {
      type: String,
      required: false,
      trim: true,
      maxLength: MAX_ADDRESS_LENGTH,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_POSTAL_CODE_LENGTH,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxLength: MAX_ADDRESS_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

export type ClientBillingAddress = InferSchemaType<
  typeof clientBillingAddressSchema
> & {
  _id: Types.ObjectId;
};
export type ClientBillingAddressDocument = ClientBillingAddress & Document;
export const ClientBillingAddressModel = model<ClientBillingAddressDocument>(
  "client-billing-addresses",
  clientBillingAddressSchema
);
