import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { auth } from "../../libs/auth";
import { Prisma, Specialty, User } from "../../../generated/prisma/client";
import {
  IBulkDeletePayload,
  IBulkStatusPayload,
  ICreateAdminPayload,
  ICreateDoctorPayload,
  IUpdateUserRolePayload,
  IUpdateUserStatusPayload,
  IUserListQuery,
} from "./user.interface";
import { notificationService } from "../notification/notification.service";
import { NotificationType } from "../../../generated/prisma/enums";
import { IRequestUser } from "../admin/admin.interface";
import { QueryBuilder } from "../../utils/query";

const userSearchableFields = ["name", "email"];
const userFilterableFields = ["role", "status", "isDeleted", "emailVerified"];

const userInclude = {
  admin: true,
  doctor: true,
  patient: true,
} satisfies Prisma.UserInclude;

type UserWithProfiles = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

const canAdminManageTarget = (requester: IRequestUser, targetRole: Role) => {
  if (requester.role === Role.SUPER_ADMIN) {
    return true;
  }

  if (requester.role === Role.ADMIN) {
    return targetRole === Role.DOCTOR || targetRole === Role.PATIENT;
  }

  return false;
};

const assertManagePermission = (
  requester: IRequestUser,
  target: UserWithProfiles,
) => {
  if (!canAdminManageTarget(requester, target.role)) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have permission to manage this user",
    );
  }
};

const getUserWithProfilesById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: userInclude,
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

const ensureRoleProfileCompatibility = (user: UserWithProfiles, role: Role) => {
  if ((role === Role.ADMIN || role === Role.SUPER_ADMIN) && !user.admin) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot assign admin role to user without admin profile",
    );
  }

  if (role === Role.DOCTOR && !user.doctor) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot assign doctor role to user without doctor profile",
    );
  }

  if (role === Role.PATIENT && !user.patient) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot assign patient role to user without patient profile",
    );
  }
};

const createDoctor = async (payload: ICreateDoctorPayload) => {
  const specialties: Specialty[] = [];

  for (const specialtyId of payload.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id: specialtyId,
      },
    });
    if (!specialty) {
      // throw new Error(`Specialty with id ${specialtyId} not found`);
      throw new AppError(
        status.NOT_FOUND,
        `Specialty with id ${specialtyId} not found`,
      );
    }
    specialties.push(specialty);
  }

  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (userExists) {
    // throw new Error("User with this email already exists");
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });

      const doctorSpecialtyData = specialties.map((specialty) => {
        return {
          doctorId: doctorData.id,
          specialtyId: specialty.id,
        };
      });

      await tx.doctorSpecialty.createMany({
        data: doctorSpecialtyData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return doctor;
    });

    void notificationService
      .createAndEmit({
        userId: userData.user.id,
        type: NotificationType.ACCOUNT,
        title: "Doctor Profile Created",
        message:
          "Your doctor profile has been created by admin. Please review your profile details.",
      })
      .catch((error) => {
        console.error("Failed to send doctor creation notification:", error);
      });

    return result;
  } catch (error) {
    console.log("Transaction error : ", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

const getAllUsers = async (query: IUserListQuery, requester: IRequestUser) => {
  const queryBuilder = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields,
  });

  queryBuilder.search().filter().include(userInclude).paginate().sort().fields();

  if (query.includeDeleted !== "true") {
    queryBuilder.where({ isDeleted: false });
  }

  if (requester.role === Role.ADMIN) {
    queryBuilder.where({
      role: {
        in: [Role.DOCTOR, Role.PATIENT],
      },
    });
  }

  return queryBuilder.execute();
};

const getUserById = async (id: string, requester: IRequestUser) => {
  const user = await getUserWithProfilesById(id);

  assertManagePermission(requester, user);

  return user;
};

const updateUserStatus = async (
  id: string,
  payload: IUpdateUserStatusPayload,
  requester: IRequestUser,
) => {
  const user = await getUserWithProfilesById(id);

  assertManagePermission(requester, user);

  if (user.id === requester.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot update your own status");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update status of a deleted user. Restore the user first",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      status: payload.status,
    },
    include: userInclude,
  });

  if (payload.status === UserStatus.BLOCKED) {
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    });
  }

  return updatedUser;
};

const updateUserRole = async (
  id: string,
  payload: IUpdateUserRolePayload,
  requester: IRequestUser,
) => {
  if (requester.role !== Role.SUPER_ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "Only super admin can change user roles",
    );
  }

  const user = await getUserWithProfilesById(id);

  if (user.id === requester.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot update your own role");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "Cannot update role of deleted user");
  }

  ensureRoleProfileCompatibility(user, payload.role);

  return prisma.user.update({
    where: { id },
    data: {
      role: payload.role,
    },
    include: userInclude,
  });
};

const deleteUser = async (id: string, requester: IRequestUser) => {
  const user = await getUserWithProfilesById(id);

  assertManagePermission(requester, user);

  if (user.id === requester.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete your own account");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "User is already deleted");
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.DELETED,
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.admin.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.doctor.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.patient.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: user.id,
      },
    });
  });

  return { message: "User deleted successfully" };
};

const restoreUser = async (id: string, requester: IRequestUser) => {
  const user = await getUserWithProfilesById(id);

  assertManagePermission(requester, user);

  if (!user.isDeleted && user.status !== UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "User is not deleted");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.ACTIVE,
        isDeleted: false,
        deletedAt: null,
      },
    });

    await tx.admin.updateMany({
      where: { userId: user.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    await tx.doctor.updateMany({
      where: { userId: user.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    await tx.patient.updateMany({
      where: { userId: user.id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  });

  return getUserWithProfilesById(id);
};

const bulkUpdateUserStatus = async (
  payload: IBulkStatusPayload,
  requester: IRequestUser,
) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: payload.userIds,
      },
    },
    include: userInclude,
  });

  if (users.length !== payload.userIds.length) {
    throw new AppError(status.NOT_FOUND, "Some users were not found");
  }

  for (const user of users) {
    assertManagePermission(requester, user);

    if (user.id === requester.userId) {
      throw new AppError(
        status.BAD_REQUEST,
        "You cannot update status for your own account",
      );
    }

    if (user.isDeleted || user.status === UserStatus.DELETED) {
      throw new AppError(
        status.BAD_REQUEST,
        "Cannot update status for deleted users",
      );
    }
  }

  const result = await prisma.user.updateMany({
    where: {
      id: {
        in: payload.userIds,
      },
    },
    data: {
      status: payload.status,
    },
  });

  if (payload.status === UserStatus.BLOCKED) {
    await prisma.session.deleteMany({
      where: {
        userId: {
          in: payload.userIds,
        },
      },
    });
  }

  return { count: result.count };
};

const bulkDeleteUsers = async (
  payload: IBulkDeletePayload,
  requester: IRequestUser,
) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: payload.userIds,
      },
    },
    include: userInclude,
  });

  if (users.length !== payload.userIds.length) {
    throw new AppError(status.NOT_FOUND, "Some users were not found");
  }

  for (const user of users) {
    assertManagePermission(requester, user);

    if (user.id === requester.userId) {
      throw new AppError(
        status.BAD_REQUEST,
        "You cannot delete your own account in bulk operation",
      );
    }

    if (user.isDeleted || user.status === UserStatus.DELETED) {
      throw new AppError(status.BAD_REQUEST, "Some users are already deleted");
    }
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const deletedUsers = await tx.user.updateMany({
      where: {
        id: {
          in: payload.userIds,
        },
      },
      data: {
        status: UserStatus.DELETED,
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.admin.updateMany({
      where: {
        userId: {
          in: payload.userIds,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.doctor.updateMany({
      where: {
        userId: {
          in: payload.userIds,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.patient.updateMany({
      where: {
        userId: {
          in: payload.userIds,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: now,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: {
          in: payload.userIds,
        },
      },
    });

    return deletedUsers;
  });

  return { count: result.count };
};

const createAdmin = async (payload: ICreateAdminPayload) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      role: Role.ADMIN,
      name: payload.admin.name,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          name: payload.admin.name,
          email: payload.admin.email,
          contactNumber: payload.admin.contactNumber,
          profilePhoto: payload.admin.profilePhoto,
        },
      });

      if (payload.admin.profilePhoto) {
        await tx.user.update({
          where: {
            id: userData.user.id,
          },
          data: {
            image: payload.admin.profilePhoto,
          },
        });
      }

      const admin = await tx.admin.findUnique({
        where: {
          id: adminData.id,
        },
        include: {
          user: true,
        },
      });

      return admin;
    });

    void notificationService
      .createAndEmit({
        userId: userData.user.id,
        type: NotificationType.ACCOUNT,
        title: "Admin Profile Created",
        message:
          "Your admin account has been created successfully. You can now access the admin panel.",
      })
      .catch((error) => {
        console.error("Failed to send admin creation notification:", error);
      });

    return result;
  } catch (error) {
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

export const userService = {
  createDoctor,
  createAdmin,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  restoreUser,
  bulkUpdateUserStatus,
  bulkDeleteUsers,
};
