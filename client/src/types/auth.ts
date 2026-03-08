export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  status: string;
  needPasswordChange: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
};

export type LoginData = {
  token: string;
  accessToken: string;
  refreshToken: string;
  redirect: boolean;
  user: AuthUser;
};

export type RegisterData = {
  token: string | null;
  user: AuthUser;
};
