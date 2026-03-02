import { randomUUID } from "node:crypto";
import { prisma } from "../src/app/libs/prisma";
import { Gender, Role, UserStatus } from "../src/generated/prisma/enums";

type DoctorSeed = {
  name: string;
  email: string;
  registrationNumber: string;
  experience: number;
  gender: (typeof Gender)[keyof typeof Gender];
  appointmentFee: number;
  qualification: string;
  currentWorkingPlace: string;
  designation: string;
  contactNumber: string;
  address: string;
  specialtyTitles: string[];
};

const specialtySeed = [
  {
    title: "Cardiology",
    description: "Diagnosis and treatment of heart diseases.",
    icon: "heart",
  },
  {
    title: "Dermatology",
    description: "Skin, hair, and nail related care.",
    icon: "skin",
  },
  {
    title: "Neurology",
    description: "Brain and nervous system disorders.",
    icon: "brain",
  },
  {
    title: "Orthopedics",
    description: "Bones, joints, and musculoskeletal health.",
    icon: "bone",
  },
] as const;

const doctorSeed: DoctorSeed[] = [
  {
    name: "Dr. Sarah Khan",
    email: "sarah.khan.doctor@example.com",
    registrationNumber: "REG-CARD-1001",
    experience: 9,
    gender: Gender.FEMALE,
    appointmentFee: 60,
    qualification: "MBBS, FCPS (Cardiology)",
    currentWorkingPlace: "Dhaka Heart Medical Center",
    designation: "Consultant Cardiologist",
    contactNumber: "01711000111",
    address: "Dhanmondi, Dhaka",
    specialtyTitles: ["Cardiology"],
  },
  {
    name: "Dr. Aminul Islam",
    email: "aminul.islam.doctor@example.com",
    registrationNumber: "REG-DERM-2002",
    experience: 6,
    gender: Gender.MALE,
    appointmentFee: 40,
    qualification: "MBBS, DDV",
    currentWorkingPlace: "City Skin Care Hospital",
    designation: "Consultant Dermatologist",
    contactNumber: "01711000222",
    address: "Uttara, Dhaka",
    specialtyTitles: ["Dermatology"],
  },
  {
    name: "Dr. Nusrat Jahan",
    email: "nusrat.jahan.doctor@example.com",
    registrationNumber: "REG-NEUR-3003",
    experience: 12,
    gender: Gender.FEMALE,
    appointmentFee: 75,
    qualification: "MBBS, MD (Neurology)",
    currentWorkingPlace: "National Neuro Institute",
    designation: "Senior Neurologist",
    contactNumber: "01711000333",
    address: "Banani, Dhaka",
    specialtyTitles: ["Neurology"],
  },
  {
    name: "Dr. Rezaul Karim",
    email: "rezaul.karim.doctor@example.com",
    registrationNumber: "REG-ORTH-4004",
    experience: 10,
    gender: Gender.MALE,
    appointmentFee: 55,
    qualification: "MBBS, MS (Orthopedics)",
    currentWorkingPlace: "Metro General Hospital",
    designation: "Orthopedic Surgeon",
    contactNumber: "01711000444",
    address: "Mirpur, Dhaka",
    specialtyTitles: ["Orthopedics"],
  },
];

async function seedDoctors() {
  const specialties = new Map<string, string>();

  for (const item of specialtySeed) {
    const specialty = await prisma.specialty.upsert({
      where: { title: item.title },
      update: {
        description: item.description,
        icon: item.icon,
        isDeleted: false,
        deletedAt: null,
      },
      create: {
        title: item.title,
        description: item.description,
        icon: item.icon,
      },
      select: { id: true, title: true },
    });

    specialties.set(specialty.title, specialty.id);
  }

  const insertedDoctors: { id: string; name: string; email: string }[] = [];

  for (const item of doctorSeed) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        role: Role.DOCTOR,
        status: UserStatus.ACTIVE,
        isDeleted: false,
        deletedAt: null,
      },
      create: {
        id: randomUUID(),
        name: item.name,
        email: item.email,
        role: Role.DOCTOR,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    const existingDoctor = await prisma.doctor.findUnique({
      where: { email: item.email },
      select: { id: true },
    });

    const doctor = existingDoctor
      ? await prisma.doctor.update({
          where: { email: item.email },
          data: {
            name: item.name,
            contactNumber: item.contactNumber,
            address: item.address,
            registrationNumber: item.registrationNumber,
            experience: item.experience,
            gender: item.gender,
            appointmentFee: item.appointmentFee,
            qualification: item.qualification,
            currentWorkingPlace: item.currentWorkingPlace,
            designation: item.designation,
            isDeleted: false,
            deletedAt: null,
          },
          select: { id: true, name: true, email: true },
        })
      : await prisma.doctor.create({
          data: {
            userId: user.id,
            name: item.name,
            email: item.email,
            contactNumber: item.contactNumber,
            address: item.address,
            registrationNumber: item.registrationNumber,
            experience: item.experience,
            gender: item.gender,
            appointmentFee: item.appointmentFee,
            qualification: item.qualification,
            currentWorkingPlace: item.currentWorkingPlace,
            designation: item.designation,
          },
          select: { id: true, name: true, email: true },
        });

    for (const title of item.specialtyTitles) {
      const specialtyId = specialties.get(title);
      if (!specialtyId) {
        continue;
      }

      await prisma.doctorSpecialty.upsert({
        where: {
          doctorId_specialtyId: {
            doctorId: doctor.id,
            specialtyId,
          },
        },
        update: {},
        create: {
          doctorId: doctor.id,
          specialtyId,
        },
      });
    }

    insertedDoctors.push(doctor);
  }

  console.table(insertedDoctors);
}

seedDoctors()
  .catch((error) => {
    console.error("Doctor seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
