import status from "http-status";
import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
  const specialty = await prisma.specialty.create({
    data: payload,
  });
  return specialty;
};
const getAllSpecialties = async (): Promise<Specialty[]> => {
  const specialties = await prisma.specialty.findMany();
  return specialties;
};
const getSpecialtyById = async (id: string): Promise<Specialty | null> => {
  const specialty = await prisma.specialty.findUnique({
    where: {
      id,
    },
  });
  if (!specialty) {
    throw new AppError(status.NOT_FOUND, "Specialty not found");
  }
  return specialty;
};
const updateSpecialty = async (
  id: string,
  payload: Specialty,
): Promise<Specialty> => {
  const isExist = await prisma.specialty.findUnique({ where: { id } });
  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Specialty is not found");
  }
  const specialty = await prisma.specialty.update({
    where: {
      id,
    },
    data: payload,
  });
  return specialty;
};
const deleteSpecialty = async (id: string): Promise<Specialty> => {
  const isExist = await prisma.specialty.findUnique({ where: { id } });
  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Specialty is not found");
  }
  const specialty = await prisma.specialty.delete({
    where: {
      id,
    },
  });
  return specialty;
};

export const specialtyService = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
