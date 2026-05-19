import { Types } from "mongoose";

export function getObjectId(id: string | Types.ObjectId) {
  if (Types.ObjectId.isValid(id)) {
    return typeof id === "string" ? new Types.ObjectId(id) : id;
  }

  throw new Error("Provided id not a valid ObjectId");
}

export function isObjectId(id: unknown): id is Types.ObjectId {
  return Types.ObjectId.isValid(id as string);
}

export function generateObjectId() {
  return new Types.ObjectId();
}
