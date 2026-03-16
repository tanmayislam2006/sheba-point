export type DoctorSpecialty = {
  specialtyId?: string;
  specialty: {
    id?: string;
    title: string;
    icon?: string | null;
    description?: string | null;
  };
};

export type DoctorSchedule = {
  scheduleId?: string;
  isBooked: boolean;
  schedule: {
    id: string;
    startDateTime: string;
    endDateTime: string;
  };
};

export type DoctorReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type Doctor = {
  id: string;
  name: string;
  email?: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  registrationNumber?: string;
  experience?: number;
  gender?: string;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  averageRating?: number;
  specialties?: DoctorSpecialty[];
  doctorSchedules?: DoctorSchedule[];
  reviews?: DoctorReview[];
};
