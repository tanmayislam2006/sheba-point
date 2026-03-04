import status from "http-status";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { IRequestUser } from "../admin/admin.interface";
import { v7 as uuid7 } from "uuid";
import {
  AppointmentStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IBookAppointmentPayload } from "./appointment.interface";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuid7());
  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: payload.doctorId,
        patientId: patientData.id,
        scheduleId: doctorSchedule.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    // Payment Integration

    const transactionId = String(uuid7());

    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },

      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,

      // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
    });

    return {
      appointmentData,
      paymentData,
      paymentUrl: session.url,
    };
  });
  return result;
};

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
  user: IRequestUser,
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
      "Completed or Cancelled appointment cannot be updated",
    );
  }

  /* ------------------------------------------------ */
  /* ADMIN / SUPER ADMIN → Full Access               */
  /* ------------------------------------------------ */

  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
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
        "This appointment does not belong to you",
      );
    }

    const doctorAllowedTransitions: Record<
      AppointmentStatus,
      AppointmentStatus[]
    > = {
      SCHEDULED: [AppointmentStatus.INPROGRESS, AppointmentStatus.CANCELED],
      INPROGRESS: [AppointmentStatus.COMPLETED],
      COMPLETED: [],
      CANCELED: [],
    };

    if (!doctorAllowedTransitions[currentStatus].includes(appointmentStatus)) {
      throw new AppError(status.BAD_REQUEST, "Invalid status update by doctor");
    }
  }

  /* ------------------------------------------------ */
  /* PATIENT RULE                                    */
  /* ------------------------------------------------ */

  if (user.role === Role.PATIENT) {
    if (user.email !== appointmentData.patient.email) {
      throw new AppError(
        status.FORBIDDEN,
        "This appointment does not belong to you",
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
        "Patient can only cancel scheduled appointment",
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

const bookAppointmentWithPayLater = async (payload : IBookAppointmentPayload, user : IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false,
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId,
        }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuid7());

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: {
                isBooked: true,
            }
        });

        const transactionId = String(uuid7());

        const paymentData = await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
             }
        });

        return {
            appointment: appointmentData,
            payment: paymentData
        };

    });

    return result;
} 
const initiatePayment = async (appointmentId: string, user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      doctor: true,
      payment: true,
    },
  });

  if (!appointmentData) {
    throw new AppError(status.NOT_FOUND, "Appointment not found");
  }

  if (!appointmentData.payment) {
    throw new AppError(
      status.NOT_FOUND,
      "Payment data not found for this appointment",
    );
  }

  if (appointmentData.payment?.status === PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment already completed for this appointment",
    );
  }

  if (appointmentData.status === AppointmentStatus.CANCELED) {
    throw new AppError(status.BAD_REQUEST, "Appointment is canceled");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with Dr. ${appointmentData.doctor.name}`,
          },
          unit_amount: appointmentData.doctor.appointmentFee * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment.id,
    },

    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}`,

    // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`,
  });

  return {
    paymentUrl: session.url,
  };
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
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getMySingleAppointment,
  changeAppointmentStatus,
  initiatePayment,
  cancelUnpaidAppointments,
  bookAppointmentWithPayLater
};
