import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../libs/auth";
import { prisma } from "../../libs/prisma";

import httpStatus, { status } from "http-status";
import AppError from "../../shared/appError";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";
import { IRequestUser } from "../admin/admin.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const isExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      patient: {
        include: {
          appointments: true,
          reviews: true,
          prescriptions: true,
          medicalReports: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          specialties: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
      admin: true,
    },
  });
  if (!isExist) {
    throw new AppError(status.NOT_FOUND, " User Not Found");
  }
  return isExist;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data as JwtPayload;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};


export const authService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken
};
