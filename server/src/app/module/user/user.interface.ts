import { Gender, Role, UserStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";

export interface ICreateDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
  };
  specialties: string[];
}

export interface ICreateAdminPayload {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}

export interface IUpdateUserRolePayload {
  role: Role;
}

export interface IBulkStatusPayload {
  userIds: string[];
  status: UserStatus;
}

export interface IBulkDeletePayload {
  userIds: string[];
}

export interface IUserListQuery extends IQueryParams {
  role?: Role;
  status?: UserStatus;
  includeDeleted?: string;
}
