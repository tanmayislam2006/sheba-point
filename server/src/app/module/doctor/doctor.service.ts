import status from "http-status";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { QueryBuilder } from "../../utils/query";
import { Doctor, Prisma } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interfaces/query.interface";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";

// getAllDoctors
const getAllDoctors = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false })
    .include({
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();
  return result;
};

// getDoctorById

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
      appointments: {
        include: {
          patient: true,
          schedule: true,
          prescription: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });
  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  return doctor;
};
const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
  const isDoctorExist = await prisma.doctor.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
  });

  if (!isDoctorExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  const { doctor: doctorData, specialties } = payload;

  await prisma.$transaction(async (tx) => {
    if (doctorData) {
      await tx.doctor.update({
        where: {
          id,
        },
        data: {
          ...doctorData,
        },
      });

      // Keep auth user profile aligned with doctor profile for shared fields.
      if (doctorData.name) {
        await tx.user.update({
          where: {
            id: isDoctorExist.userId,
          },
          data: {
            name: doctorData.name,
          },
        });
      }
    }

    if (specialties && specialties.length > 0) {
      for (const specialty of specialties) {
        const { specialtyId, shouldDelete } = specialty;
        if (shouldDelete) {
          await tx.doctorSpecialty.deleteMany({
            where: {
              doctorId: id,
              specialtyId: specialtyId,
            },
          });
        } else {
          await tx.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              },
            },
            create: {
              doctorId: id,
              specialtyId,
            },
            update: {},
          });
        }
      }
    }
  });

  const doctor = await getDoctorById(id);

  return doctor;
};
//soft delete
const deleteDoctor = async (id: string) => {
  const isDoctorExist = await prisma.doctor.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    },
    include: { user: true },
  });

  if (!isDoctorExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isDoctorExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED, // Optional: you may also want to block the user
      },
    });
    // logic to delete all sessions of the user
    await tx.session.deleteMany({
      where: { userId: isDoctorExist.userId },
    });

    await tx.doctorSpecialty.deleteMany({
      where: { doctorId: id },
    });
  });

  return { message: "Doctor deleted successfully" };
};
export const doctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
