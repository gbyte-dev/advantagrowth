import api from "@/lib/axios";

export type OwnerRegistrationData = {
  restaurant_name: string;
  owner_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
};

export type VerifyRegistrationEmailData = {
  email: string;
  otp: string;
};

// Owner Registration
export const ownerRegister = (
  data: OwnerRegistrationData
) => {
  return api.post(
    "/auth/register",
    data
  );
};

// Registration Email OTP Verification
export const verifyRegistrationEmail = (
  data: VerifyRegistrationEmailData
) => {
  return api.post(
    "/auth/email/verify",
    data
  );
};

export type RequestPasswordResetData = {
  email: string;
};

export type ResetPasswordData = {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirmation: string;
};

// Resend Registration OTP
export const resendRegistrationOtp = (
  email: string
) => {
  return api.post(
    "/auth/email/resend",
    {
      email,
    }
  );
};

// Request Password Reset OTP
export const requestPasswordResetOtp = (
  data: RequestPasswordResetData
) => {
  return api.post(
    "/auth/password/forgot",
    data
  );
};

// Verify OTP and Reset Password
export const resetPasswordWithOtp = (
  data: ResetPasswordData
) => {
  return api.post(
    "/auth/password/reset",
    data
  );
};

// Unified Owner + Staff Login
export const login = (data: {
  login: string;
  password: string;
}) => {
  return api.post(
    "/auth/login",
    data
  );
};

// Super Admin Login
export const superAdminLogin = (
  data: {
    email: string;
    password: string;
  }
) => {
  return api.post(
    "/auth/superadmin/login",
    data
  );
};