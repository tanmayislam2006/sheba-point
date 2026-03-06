import Stripe from "stripe";
import { prisma } from "../../libs/prisma";
import { NotificationType, PaymentStatus } from "../../../generated/prisma/enums";
import { notificationService } from "../notification/notification.service";

const emitNotificationSafely = (
  payload: Parameters<typeof notificationService.createAndEmit>[0],
) => {
  void notificationService.createAndEmit(payload).catch((error) => {
    console.error("Failed to send payment notification:", error);
  });
};

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return {
          message: "Missing appointmentId or paymentId in session metadata",
        };
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
        include: {
          patient: true,
          doctor: true,
        },
      });

      if (!appointment) {
        console.error(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` };
      }

      const paid = session.payment_status === "paid";

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus: paid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
          },
        });

        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventId: event.id,
            status: paid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });

      if (paid) {
        emitNotificationSafely({
          userId: appointment.patient.userId,
          type: NotificationType.APPOINTMENT,
          title: "Payment Successful",
          message: `Payment completed for your appointment with Dr. ${appointment.doctor.name}.`,
          metadata: {
            action: "payment_completed",
            appointmentId,
            paymentId,
            redirectUrl: "/dashboard/appointments",
          },
        });

        emitNotificationSafely({
          userId: appointment.doctor.userId,
          type: NotificationType.APPOINTMENT,
          title: "Appointment Payment Received",
          message: `${appointment.patient.name} completed payment for the appointment.`,
          metadata: {
            action: "payment_completed",
            appointmentId,
            paymentId,
            redirectUrl: "/dashboard/appointments",
          },
        });
      }

      console.log(
        `Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`,
      );
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await prisma.payment.updateMany({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventId: event.id,
            status: PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      }

      if (appointmentId) {
        const appointment = await prisma.appointment.findUnique({
          where: {
            id: appointmentId,
          },
          include: {
            patient: true,
            doctor: true,
          },
        });

        if (appointment) {
          emitNotificationSafely({
            userId: appointment.patient.userId,
            type: NotificationType.APPOINTMENT,
            title: "Payment Session Expired",
            message: "Your payment session expired. Please try payment again.",
            metadata: {
              action: "payment_session_expired",
              appointmentId,
              paymentId,
              redirectUrl: "/dashboard/appointments",
            },
          });

          emitNotificationSafely({
            userId: appointment.doctor.userId,
            type: NotificationType.APPOINTMENT,
            title: "Payment Pending",
            message: `Payment for ${appointment.patient.name}'s appointment session has expired.`,
            metadata: {
              action: "payment_session_expired",
              appointmentId,
              paymentId,
              redirectUrl: "/dashboard/appointments",
            },
          });
        }
      }

      console.log(
        `Checkout session ${session.id} expired. Marking associated payment as failed.`,
      );
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      console.log(
        `Payment intent ${paymentIntent.id} failed. Marking associated payment as failed.`,
      );
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

export const paymentService = {
  handlerStripeWebhookEvent,
};
