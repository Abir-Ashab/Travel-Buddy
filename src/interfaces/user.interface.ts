<<<<<<< HEAD
export const USER_Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EXPLORER: "EXPLORER",
  TRAVELER: "TRAVELER",
=======
//  name
//  role
//  email
//  password
//  status
//  passwordChangedAt

export const USER_Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
} as const;

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export type TUser = {
  name: string;
  role: keyof typeof USER_Role;
  email: string;
  password: string;
  status: keyof typeof USER_STATUS;
  passwordChangedAt?: Date;
};

