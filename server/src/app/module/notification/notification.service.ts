import status from "http-status";
import { NotificationChannel, NotificationType } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { emitToUser } from "../../socket/socket";

type CreateNotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type?: (typeof NotificationType)[keyof typeof NotificationType];
  channel?: (typeof NotificationChannel)[keyof typeof NotificationChannel];
  metadata?: Prisma.InputJsonValue;
};

const createAndEmit = async (payload: CreateNotificationPayload) => {
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type ?? NotificationType.SYSTEM,
      channel: payload.channel ?? NotificationChannel.IN_APP,
      metadata: payload.metadata,
    },
  });

  emitToUser(payload.userId, "notification:new", notification);

  return notification;
};

const getMyNotifications = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const unreadOnly = query.unreadOnly === "true";
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const markAsRead = async (userId: string, id: string) => {
  const updated = await prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  if (updated.count === 0) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  return prisma.notification.findUnique({
    where: { id },
  });
};

const markAllAsRead = async (userId: string) => {
  const updated = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return {
    count: updated.count,
  };
};

export const notificationService = {
  createAndEmit,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
