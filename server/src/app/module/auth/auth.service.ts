import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../libs/auth";
import { prisma } from "../../libs/prisma";

import httpStatus from "http-status";
import AppError from "../../shared/appError";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      //default values
      // needsPasswordChange: false,
      // role: Role.PATIENT
    },
  });

  if (!data.user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to register user. Please try again.",
    );
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: data.user.id },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User not found after registration.",
      );
    }

    await tx.patient.upsert({
      where: { userId: user.id },
      update: {
        name: data.user.name,
        email: data.user.email,
      },
      create: {
        name: data.user.name,
        email: data.user.email,
        userId: user.id,
      },
    });
  });

  return data;
};
interface ILoginUserPayload {
  email: string;
  password: string;
}
const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked. Please contact support for more information.",
    );
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is deleted. Please contact support for more information.",
    );
  }

  return data;
};
export const authService = {
  registerPatient,
  loginUser,
};
