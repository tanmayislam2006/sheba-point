import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { IRequestUser, IUpdateAdminPayload } from "./admin.interface";

const getAllAdmins = async () => {
  const admins = await prisma.admin.findMany({
    where: {
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
    },
  });
  return admins;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin or Super Admin not found");
  }

  return admin;
};

const updateAdmin = async (
  id: string,
  payload: IUpdateAdminPayload,
  requester: IRequestUser,
) => {
  const isAdminExist = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
    },
  });

  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin or Super Admin not found");
  }

  // Only SUPER_ADMIN can update ADMIN/SUPER_ADMIN users.
  if (requester.role !== Role.SUPER_ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "Only super admin can update admin users",
    );
  }

  const { admin } = payload;

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: {
        id,
      },
      data: {
        ...admin,
      },
      include: {
        user: true,
      },
    });

    if (admin?.name || admin?.profilePhoto) {
      await tx.user.update({
        where: {
          id: isAdminExist.userId,
        },
        data: {
          ...(admin?.name ? { name: admin.name } : {}),
          ...(admin?.profilePhoto ? { image: admin.profilePhoto } : {}),
        },
      });
    }

    const updatedAdmin = await tx.admin.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    return updatedAdmin;
  });

  return result;
};

const deleteAdmin = async (id: string, requester: IRequestUser) => {
  const isAdminExist = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
    },
  });

  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin or Super Admin not found");
  }

  // Only SUPER_ADMIN can delete ADMIN/SUPER_ADMIN users.
  if (requester.role !== Role.SUPER_ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "Only super admin can delete admin users",
    );
  }

  if (isAdminExist.userId === requester.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }

  await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isAdminExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    await tx.account.deleteMany({
      where: { userId: isAdminExist.userId },
    });
  });

  return { message: "Admin deleted successfully" };
};

export const adminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
