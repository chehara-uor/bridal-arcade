import axios from "axios";

export interface PasswordResetVerification {
  email: string;
  phone: string;
  userId: string | number;
  verificationToken: string;
  expiresAt?: string | number;
  otpChallenge: string;
}

export async function verifyPasswordResetAccount(email: string, phone: string): Promise<PasswordResetVerification> {
  const normalizedEmail = email.trim().toLowerCase();
  const response = await axios.post("/api/auth/reset-verify", { email: normalizedEmail, phone: phone.trim() });
  if (!response.data?.user_id || !response.data?.verification_token || !response.data?.otp_challenge) throw new Error("The server returned an incomplete verification response.");
  return {
    email: normalizedEmail,
    phone: phone.trim(),
    userId: response.data.user_id as string | number,
    verificationToken: String(response.data.verification_token),
    expiresAt: response.data.expires_at as string | number | undefined,
    otpChallenge: String(response.data.otp_challenge),
  };
}

export async function verifyPasswordResetOtp(verification: PasswordResetVerification, otp: string): Promise<string> {
  const response = await axios.post("/api/auth/reset-otp", {
    email: verification.email,
    phone: verification.phone,
    user_id: verification.userId,
    verification_token: verification.verificationToken,
    otp_challenge: verification.otpChallenge,
    otp,
  });
  if (!response.data?.otp_proof) throw new Error("The server returned an incomplete OTP response.");
  return String(response.data.otp_proof);
}

export async function setResetPassword(verification: PasswordResetVerification, otpProof: string, newPassword: string, confirmPassword: string): Promise<void> {
  await axios.post("/api/auth/reset-password", {
    email: verification.email,
    user_id: verification.userId,
    verification_token: verification.verificationToken,
    otp_proof: otpProof,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
}

export function isExpiredPasswordReset(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
