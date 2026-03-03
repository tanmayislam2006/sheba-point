import status from "http-status";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { IRequestUser } from "../admin/admin.interface";
import { v7 as uuid7 } from "uuid";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { IBookAppointmentPayload } from "./appointment.interface";


const bookAppointment =async(payload:IBookAppointmentPayload,user :IRequestUser)=>{

}


const getMyAppointments = async (user: IRequestUser) => {
  //user can be patient or doctor, so we need to check both
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email,
    },
  });

  let appointments = [];
  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new AppError(status.NOT_FOUND, "User is not found");
  }
  return appointments;
};
const getMySingleAppointment = async (
  appointmentId: string,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user?.email,
    },
  });

  let appointment;

  if (patientData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  }

  if (!appointment) {
    throw new AppError(status.NOT_FOUND, "Appointment not found");
  }

  return appointment;
};
const getAllAppointments = async () => {
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  });
  return appointments;
};
const changeAppointmentStatus = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: IRequestUser
) => {

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: {
      doctor: true,
      patient: true,
    },
  });

  const currentStatus = appointmentData.status;

  /* ------------------------------------------------ */
  /* Rule 1: Completed or Cancelled cannot change    */
  /* ------------------------------------------------ */

  if (
    currentStatus === AppointmentStatus.COMPLETED ||
    currentStatus === AppointmentStatus.CANCELED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Completed or Cancelled appointment cannot be updated"
    );
  }

  /* ------------------------------------------------ */
  /* ADMIN / SUPER ADMIN → Full Access               */
  /* ------------------------------------------------ */

  if (
    user.role === Role.ADMIN ||
    user.role === Role.SUPER_ADMIN
  ) {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: appointmentStatus },
    });
  }

  /* ------------------------------------------------ */
  /* DOCTOR RULE                                     */
  /* ------------------------------------------------ */

  if (user.role === Role.DOCTOR) {

    if (user.email !== appointmentData.doctor.email) {
      throw new AppError(
        status.FORBIDDEN,
        "This appointment does not belong to you"
      );
    }

    const doctorAllowedTransitions: Record<
      AppointmentStatus,
      AppointmentStatus[]
    > = {
      SCHEDULED: [
        AppointmentStatus.INPROGRESS,
        AppointmentStatus.CANCELED,
      ],
      INPROGRESS: [AppointmentStatus.COMPLETED],
      COMPLETED: [],
      CANCELED: [],
    };

    if (
      !doctorAllowedTransitions[currentStatus].includes(
        appointmentStatus
      )
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid status update by doctor"
      );
    }
  }

  /* ------------------------------------------------ */
  /* PATIENT RULE                                    */
  /* ------------------------------------------------ */

  if (user.role === Role.PATIENT) {

    if (user.email !== appointmentData.patient.email) {
      throw new AppError(
        status.FORBIDDEN,
        "This appointment does not belong to you"
      );
    }

    if (
      !(
        currentStatus === AppointmentStatus.SCHEDULED &&
        appointmentStatus === AppointmentStatus.CANCELED
      )
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "Patient can only cancel scheduled appointment"
      );
    }
  }

  /* ------------------------------------------------ */
  /* FINAL UPDATE                                    */
  /* ------------------------------------------------ */

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: appointmentStatus },
  });
};

const cancelUnpaidAppointments = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      // status: AppointmentStatus.SCHEDULED,
      createdAt: {
        lte: thirtyMinutesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentToCancel = unpaidAppointments.map(
    (appointment) => appointment.id,
  );

  await prisma.$transaction(async (tx) => {
    await tx.appointment.updateMany({
      where: {
        id: {
          in: appointmentToCancel,
        },
      },
      data: {
        status: AppointmentStatus.CANCELED,
      },
    });

    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentToCancel,
        },
      },
    });

    for (const unpaidAppointment of unpaidAppointments) {
      await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unpaidAppointment.doctorId,
            scheduleId: unpaidAppointment.scheduleId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const appointmentService = {
  getMyAppointments,
  getAllAppointments,
  getMySingleAppointment,
  changeAppointmentStatus,
  cancelUnpaidAppointments
};
