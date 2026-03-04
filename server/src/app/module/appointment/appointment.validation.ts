import z from "zod";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const bookAppointmentZodSchema = z.object({
  doctorId: z.uuid("Doctor ID must be a valid UUID"),
  scheduleId: z.uuid("Schedule ID must be a valid UUID"),
});

const changeAppointmentStatusZodSchema = z.object({
  status: z.enum(
    [
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.INPROGRESS,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELED,
    ],
    "Invalid appointment status",
  ),
});

export const appointmentValidation = {
  bookAppointmentZodSchema,
  changeAppointmentStatusZodSchema,
};
