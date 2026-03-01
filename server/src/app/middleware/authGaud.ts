import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../shared/appError";
import status from "http-status";
import { prisma } from "../libs/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authGaud = (...role: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // better auth session token verified
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );
      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized: No session token provided",
        );
      }

      if (sessionToken) {
        // find the user session in db
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;
          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);
          const sessionLifetime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentageRemaining = (timeRemaining / sessionLifetime) * 100;

          if (percentageRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log("Session Expiring Soon!!");
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden: User is blocked or deleted",
            );
          }

          if (user.isDeleted) {
            throw new AppError(status.FORBIDDEN, "Forbidden: User is deleted");
          }

          if (role.length > 0 && !role.includes(user.role as Role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden: You don't have permission to access this resource",
            );
          }

          req.user = {
            userId: user.id,
            role: user.role as Role,
            email: user.email,
          };

          const accessToken = cookieUtils.getCookie(req, "accessToken");
          if (!accessToken) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized: No access token provided",
            );
          }
          // access token verification
          const verifiedToken = jwtUtils.verifyToken(
            accessToken,
            envVars.ACCESS_TOKEN_SECRET,
          ) as JwtPayload;

          if (!verifiedToken.success) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access! Invalid access token.",
            );
          }
          //   check the role in token
          if (
            role.length > 0 &&
            !role.includes(verifiedToken.data.role as Role)
          ) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden: You don't have permission to access this resource",
            );
          }
        }
        next();
      }
    } catch (error: any) {
      next(error);
      console.log(error);
    }
  };
};
