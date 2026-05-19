import { Request, Response } from "express";
import { emailSubscriptionSchema, supportContactSchema } from "@/dtos";
import {
  AppError,
  AuthenticatedRequest,
  ValidatedRequest,
} from "@/middlewares";
import {
  ClientDetailModel,
  EmailSubscriptionModel,
  SupportContactModel,
} from "@/models";

export async function addNewEmailSubscriptionController(
  req: ValidatedRequest<typeof emailSubscriptionSchema>,
  res: Response
) {
  const { email } = req.validated.body;
  const newSubscription = await EmailSubscriptionModel.updateOne(
    { email },
    { email },
    { upsert: true }
  );
  if (newSubscription.matchedCount > 0 || newSubscription.upsertedCount > 0) {
    res.status(201).json({ email });
    return;
  }

  throw new AppError("Failed to add email subscription", 500);
}

export async function getEmailSubscriptionsController(
  req: Request,
  res: Response
) {
  const emailSubscriptions = await EmailSubscriptionModel.find({});
  res.status(200).json(emailSubscriptions);
}

export async function createNewSupportContactController(
  req: ValidatedRequest<typeof supportContactSchema>,
  res: Response
) {
  const supportContactDto = req.validated.body;
  const newSupportContact = await SupportContactModel.create(supportContactDto);
  res.status(201).json(newSupportContact);
}

export async function getContactSupportRequestController(
  req: Request,
  res: Response
) {
  const supportContacts = await SupportContactModel.find({});
  res.status(200).json(supportContacts);
}

export async function getClientOverviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  const clientOverview = await ClientDetailModel.countDocuments();
  res.status(200).json({ count: clientOverview });
}
