import bcrypt from "bcrypt";
import { Response } from "express";
import { signinSchema, signupSchema } from "@/dtos";
import {
  AppError,
  AuthenticatedRequest,
  ValidatedRequest,
} from "@/middlewares";
import { UserModel } from "@/models";
import { createUserService, generateJwtSessionToken } from "@/services";

export async function signupController(
  req: ValidatedRequest<typeof signupSchema>,
  res: Response
) {
  const userDto = req.validated.body;
  const existingUser = await UserModel.findOne({ email: userDto.email });
  if (existingUser) throw new AppError("User already exists", 409);

  const { _id, email, username } = await createUserService(userDto);
  const sessionToken = generateJwtSessionToken(_id.toString());

  res
    .status(201)
    .json({ _id: _id, email: email, username: username, sessionToken });
}

export async function signinController(
  req: ValidatedRequest<typeof signinSchema>,
  res: Response
) {
  const { email, password } = req.validated.body;
  const existingUser = await UserModel.findOne({ email });
  if (!existingUser) throw new AppError("Invalid credentials", 400);

  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) throw new AppError("Invalid credentials", 400);

  const sessionToken = generateJwtSessionToken(existingUser._id.toString());
  res.status(200).json({ _id: existingUser._id, sessionToken });
}

export async function isAuthController(
  req: AuthenticatedRequest,
  res: Response
) {
  res.status(200).json({
    isAuthenticated: true,
    user: req.user,
  });
}
