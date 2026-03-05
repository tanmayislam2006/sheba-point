import status from "http-status";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../config/cloudinary.config";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { sendEmail } from "../../utils/email";
import { IRequestUser } from "../admin/admin.interface";
import {
  ICreatePrescriptionPayload,
  IUpdatePrescriptionPayload,
} from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

const getDoctorSpecialization = (
  specialties: { specialty: { title: string } }[],
): string =>
  specialties.length > 0
    ? specialties.map((item) => item.specialty.title).join(", ")
    : "General Medicine";

const givePrescription = async (
  user: IRequestUser,
  payload: ICreatePrescriptionPayload,
) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          specialties: {
            include: {
              specialty: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
      schedule: true,
    },
  });

  if (appointmentData.doctorId !== doctorData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only create prescriptions for your own appointments",
    );
  }

  if (
    appointmentData.status !== AppointmentStatus.INPROGRESS &&
    appointmentData.status !== AppointmentStatus.COMPLETED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Prescription can be created only for in-progress or completed appointments",
    );
  }

  const existingPrescription = await prisma.prescription.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (existingPrescription) {
    throw new AppError(
      status.BAD_REQUEST,
      "Prescription already exists for this appointment. Please update it instead.",
    );
  }

  const createdPrescription = await prisma.prescription.create({
    data: {
      appointmentId: payload.appointmentId,
      instructions: payload.instructions,
      followUpDate: payload.followUpDate,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
    },
    include: {
      patient: true,
      doctor: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  let uploadedPdfUrl: string | null = null;
  const specialization = getDoctorSpecialization(
    appointmentData.doctor.specialties,
  );
  const fileName = `Prescription-${createdPrescription.id}.pdf`;

  try {
    const pdfBuffer = await generatePrescriptionPDF({
      doctorName: doctorData.name,
      doctorEmail: doctorData.email,
      patientName: appointmentData.patient.name,
      patientEmail: appointmentData.patient.email,
      specialization,
      appointmentDate: appointmentData.schedule.startDateTime,
      instructions: payload.instructions,
      followUpDate: payload.followUpDate,
      prescriptionId: createdPrescription.id,
      createdAt: createdPrescription.createdAt,
    });

    const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
    uploadedPdfUrl = uploadedFile.secure_url;

    const updatedPrescription = await prisma.prescription.update({
      where: {
        id: createdPrescription.id,
      },
      data: {
        pdfUrl: uploadedPdfUrl,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: {
          include: {
            schedule: true,
          },
        },
      },
    });

    try {
      await sendEmail({
        to: appointmentData.patient.email,
        subject: `New prescription from Dr. ${doctorData.name}`,
        templateName: "prescription",
        templateData: {
          doctorName: doctorData.name,
          patientName: appointmentData.patient.name,
          specialization,
          appointmentDate: formatDateTime(appointmentData.schedule.startDateTime),
          issuedDate: formatDate(createdPrescription.createdAt),
          prescriptionId: createdPrescription.id,
          instructions: payload.instructions,
          followUpDate: formatDate(payload.followUpDate),
          pdfUrl: uploadedPdfUrl,
        },
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to send prescription email notification:", error);
    }

    return updatedPrescription;
  } catch (error) {
    if (uploadedPdfUrl) {
      try {
        await deleteFileFromCloudinary(uploadedPdfUrl);
      } catch (deleteError) {
        console.error("Failed to cleanup uploaded prescription PDF:", deleteError);
      }
    }

    await prisma.prescription.delete({
      where: {
        id: createdPrescription.id,
      },
    });

    throw error;
  }
};

const myPrescriptions = async (user: IRequestUser) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (userData.role === Role.DOCTOR) {
    return prisma.prescription.findMany({
      where: {
        doctor: {
          email: user.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: {
          include: {
            schedule: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (userData.role === Role.PATIENT) {
    return prisma.prescription.findMany({
      where: {
        patient: {
          email: user.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: {
          include: {
            schedule: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  throw new AppError(
    status.FORBIDDEN,
    "You are not authorized to view prescription history",
  );
};

const getAllPrescriptions = async () => {
  return prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updatePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
  payload: IUpdatePrescriptionPayload,
) => {
  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: {
        include: {
          specialties: {
            include: {
              specialty: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });

  if (user.email !== prescriptionData.doctor.email) {
    throw new AppError(status.FORBIDDEN, "This prescription does not belong to you");
  }

  const updatedInstructions = payload.instructions ?? prescriptionData.instructions;
  const updatedFollowUpDate = payload.followUpDate ?? prescriptionData.followUpDate;
  const specialization = getDoctorSpecialization(prescriptionData.doctor.specialties);

  const pdfBuffer = await generatePrescriptionPDF({
    doctorName: prescriptionData.doctor.name,
    doctorEmail: prescriptionData.doctor.email,
    patientName: prescriptionData.patient.name,
    patientEmail: prescriptionData.patient.email,
    specialization,
    appointmentDate: prescriptionData.appointment.schedule.startDateTime,
    instructions: updatedInstructions,
    followUpDate: updatedFollowUpDate,
    prescriptionId: prescriptionData.id,
    createdAt: prescriptionData.createdAt,
  });

  const fileName = `Prescription-${prescriptionData.id}-updated.pdf`;
  const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
  const newPdfUrl = uploadedFile.secure_url;

  try {
    const result = await prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: {
        instructions: updatedInstructions,
        followUpDate: updatedFollowUpDate,
        pdfUrl: newPdfUrl,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: {
          include: {
            schedule: true,
          },
        },
      },
    });

    if (prescriptionData.pdfUrl && prescriptionData.pdfUrl !== newPdfUrl) {
      try {
        await deleteFileFromCloudinary(prescriptionData.pdfUrl);
      } catch (deleteError) {
        console.error("Failed to delete old prescription PDF:", deleteError);
      }
    }

    try {
      await sendEmail({
        to: result.patient.email,
        subject: `Your prescription was updated by Dr. ${result.doctor.name}`,
        templateName: "prescription",
        templateData: {
          doctorName: result.doctor.name,
          patientName: result.patient.name,
          specialization,
          appointmentDate: formatDateTime(result.appointment.schedule.startDateTime),
          issuedDate: formatDate(result.createdAt),
          prescriptionId: result.id,
          instructions: result.instructions,
          followUpDate: formatDate(result.followUpDate),
          pdfUrl: newPdfUrl,
        },
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (emailError) {
      console.error("Failed to send updated prescription email:", emailError);
    }

    return result;
  } catch (error) {
    try {
      await deleteFileFromCloudinary(newPdfUrl);
    } catch (cleanupError) {
      console.error("Failed to cleanup new prescription PDF after update error:", cleanupError);
    }
    throw error;
  }
};

const deletePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
): Promise<void> => {
  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      doctor: true,
    },
  });

  if (user.email !== prescriptionData.doctor.email) {
    throw new AppError(status.FORBIDDEN, "This prescription does not belong to you");
  }

  await prisma.prescription.delete({
    where: {
      id: prescriptionId,
    },
  });

  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      console.error("Failed to delete prescription PDF from Cloudinary:", deleteError);
    }
  }
};

export const prescriptionService = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
