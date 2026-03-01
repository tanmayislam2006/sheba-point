export interface IUpdateAdminPayload {
  admin?: {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
  };
}

export interface IRequestUser {
  userId: string;
  email: string;
  role: string;
}
