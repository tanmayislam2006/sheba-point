import PDFDocument from "pdfkit";
import { envVars } from "../../config/env";

interface PrescriptionData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  specialization?: string;
  followUpDate: Date;
  instructions: string;
  prescriptionId: string;
  appointmentDate: Date;
  createdAt: Date;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export const generatePrescriptionPDF = async (
  prescriptionData: PrescriptionData,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 36,
      });

      const chunks: Buffer[] = [];
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 72;

      doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", (error: Error) => {
        reject(error);
      });

      doc.rect(0, 0, pageWidth, 148).fill("#0B3C5D");

      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("Prescription", 36, 40);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text("Sheba Point Digital Care", 36, 74)
        .text(`Prescription ID: ${prescriptionData.prescriptionId}`, 36, 92);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          `Issued: ${formatDate(prescriptionData.createdAt)}`,
          pageWidth - 210,
          48,
          {
            width: 174,
            align: "right",
          },
        );

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          `Follow-up: ${formatDate(prescriptionData.followUpDate)}`,
          pageWidth - 210,
          66,
          {
            width: 174,
            align: "right",
          },
        );

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          `Appointment: ${formatDateTime(prescriptionData.appointmentDate)}`,
          pageWidth - 250,
          84,
          {
            width: 214,
            align: "right",
          },
        );

      doc.roundedRect(36, 128, contentWidth, 92, 10).fill("#F7FBFE");

      doc
        .fillColor("#1F2937")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Doctor", 52, 146)
        .text("Patient", 320, 146);

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Name: ${prescriptionData.doctorName}`, 52, 164)
        .text(`Email: ${prescriptionData.doctorEmail}`, 52, 180)
        .text(
          `Specialization: ${prescriptionData.specialization ?? "General Medicine"}`,
          52,
          196,
          { width: 230 },
        );

      doc
        .text(`Name: ${prescriptionData.patientName}`, 320, 164)
        .text(`Email: ${prescriptionData.patientEmail}`, 320, 180);

      doc
        .roundedRect(36, 236, contentWidth, 24, 6)
        .fill("#EAF4FA")
        .fillColor("#0B3C5D")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Clinical Instructions", 50, 243);

      doc
        .fillColor("#111827")
        .font("Helvetica")
        .fontSize(11)
        .text(prescriptionData.instructions, 50, 276, {
          width: contentWidth - 28,
          align: "left",
          lineGap: 4,
        });

      const footerY = Math.min(doc.y + 24, doc.page.height - 90);
      doc
        .strokeColor("#C7D2FE")
        .lineWidth(1)
        .moveTo(36, footerY)
        .lineTo(pageWidth - 36, footerY)
        .stroke();

      doc
        .fillColor("#4B5563")
        .font("Helvetica")
        .fontSize(9)
        .text(
          "This prescription is digitally generated and valid without a physical signature.",
          36,
          footerY + 12,
          { width: contentWidth, align: "center" },
        )
        .text(`Patient portal: ${envVars.FRONTEND_URL}`, 36, footerY + 28, {
          width: contentWidth,
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
