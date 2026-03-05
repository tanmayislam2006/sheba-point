import status from "http-status";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { IRequestUser } from "../admin/admin.interface";
import { v7 as uuid7 } from "uuid";
import {
  AppointmentStatus,
  NotificationType,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IBookAppointmentPayload } from "./appointment.interface";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { notificationService } from "../notification/notification.service";

const emitNotificationSafely = (
  payload: Parameters<typeof notificationService.createAndEmit>[0],
) => {
  void notificationService.createAndEmit(payload).catch((error) => {
    console.error("Failed to send appointment notification:", error);
  });
};

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
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
    });

    return {
      appointmentData,
      paymentData,
      paymentUrl: session.url,
    };
  });

  emitNotificationSafely({
    userId: patientData.userId,
    type: NotificationType.APPOINTMENT,
    title: "Appointment Booked",
    message: `Your appointment with Dr. ${doctorData.name} has been booked successfully.`,
    metadata: {
      action: "appointment_booked",
      appointmentId: result.appointmentData.id,
      paymentId: result.paymentData.id,
      scheduleId: scheduleData.id,
      redirectUrl: "/dashboard/appointments",
    },
  });

  emitNotificationSafely({
    userId: doctorData.userId,
    type: NotificationType.APPOINTMENT,
    title: "New Appointment",
    message: `${patientData.name} booked an appointment with you.`,
    metadata: {
      action: "appointment_booked",
      appointmentId: result.appointmentData.id,
      scheduleId: scheduleData.id,
      redirectUrl: "/dashboard/appointments",
    },
  });

  return result;
};

const getMyAppointments = async (user: IRequestUser) => {
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

  if (
    currentStatus === AppointmentStatus.COMPLETED ||
    currentStatus === AppointmentStatus.CANCELED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Completed or Cancelled appointment cannot be updated",
    );
  }

  let updatedAppointment;

  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: appointmentStatus },
    });
  } else {
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

    updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: appointmentStatus },
    });
  }

  const metadata = {
    action: "appointment_status_changed",
    appointmentId: appointmentData.id,
    previousStatus: currentStatus,
    currentStatus: appointmentStatus,
    redirectUrl: "/dashboard/appointments",
  };

  if (user.role === Role.PATIENT) {
    emitNotificationSafely({
      userId: appointmentData.doctor.userId,
      type: NotificationType.APPOINTMENT,
      title: "Appointment Updated",
      message: `${appointmentData.patient.name} changed appointment status to ${appointmentStatus}.`,
      metadata,
    });
  } else if (user.role === Role.DOCTOR) {
    emitNotificationSafely({
      userId: appointmentData.patient.userId,
      type: NotificationType.APPOINTMENT,
      title: "Appointment Updated",
      message: `Dr. ${appointmentData.doctor.name} changed your appointment status to ${appointmentStatus}.`,
      metadata,
    });
  } else {
    emitNotificationSafely({
      userId: appointmentData.patient.userId,
      type: NotificationType.APPOINTMENT,
      title: "Appointment Updated",
      message: `Your appointment status was updated to ${appointmentStatus} by admin.`,
      metadata,
    });

    emitNotificationSafely({
      userId: appointmentData.doctor.userId,
      type: NotificationType.APPOINTMENT,
      title: "Appointment Updated",
      message: `Appointment status for ${appointmentData.patient.name} was updated to ${appointmentStatus} by admin.`,
      metadata,
    });
  }

  return updatedAppointment;
};

const bookAppointmentWithPayLater = async (
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

    const transactionId = String(uuid7());

    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return {
      appointment: appointmentData,
      payment: paymentData,
    };
  });

  emitNotificationSafely({
    userId: patientData.userId,
    type: NotificationType.APPOINTMENT,
    title: "Appointment Booked",
    message: `Your appointment with Dr. ${doctorData.name} has been booked. Please complete payment before schedule time.`,
    metadata: {
      action: "appointment_booked_pay_later",
      appointmentId: result.appointment.id,
      paymentId: result.payment.id,
      scheduleId: scheduleData.id,
      redirectUrl: "/dashboard/appointments",
    },
  });

  emitNotificationSafely({
    userId: doctorData.userId,
    type: NotificationType.APPOINTMENT,
    title: "New Appointment",
    message: `${patientData.name} booked an appointment with you (payment pending).`,
    metadata: {
      action: "appointment_booked_pay_later",
      appointmentId: result.appointment.id,
      scheduleId: scheduleData.id,
      redirectUrl: "/dashboard/appointments",
    },
  });

  return result;
};

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

  if (!appointmentData.payment) {
    throw new AppError(
      status.NOT_FOUND,
      "Payment data not found for this appointment",
    );
  }

  if (appointmentData.payment.status === PaymentStatus.PAID) {
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
      createdAt: {
        lte: thirtyMinutesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
    include: {
      patient: true,
      doctor: true,
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

  for (const unpaidAppointment of unpaidAppointments) {
    emitNotificationSafely({
      userId: unpaidAppointment.patient.userId,
      type: NotificationType.APPOINTMENT,
      title: "Appointment Canceled",
      message:
        "Your appointment was canceled because payment was not completed on time.",
      metadata: {
        action: "appointment_auto_canceled_unpaid",
        appointmentId: unpaidAppointment.id,
        redirectUrl: "/dashboard/appointments",
      },
    });

    emitNotificationSafely({
      userId: unpaidAppointment.doctor.userId,
      type: NotificationType.APPOINTMENT,
      title: "Appointment Canceled",
      message: `Appointment for ${unpaidAppointment.patient.name} was auto-canceled due to unpaid status.`,
      metadata: {
        action: "appointment_auto_canceled_unpaid",
        appointmentId: unpaidAppointment.id,
        redirectUrl: "/dashboard/appointments",
      },
    });
  }
};

export const appointmentService = {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getMySingleAppointment,
  changeAppointmentStatus,
  initiatePayment,
  cancelUnpaidAppointments,
  bookAppointmentWithPayLater,
};
