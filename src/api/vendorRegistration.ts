import { registerUser } from "./register";
import { loginPartner, type PortalUser } from "./portal";

export interface VendorAccountData { name: string; email: string; phone: string; password: string; account_type: "business"; }
export interface VendorProfileData { business_name: string; cover_image: File; about: string; district: string; areas_served: string[]; phone: string; instagram?: string; opening_hours?: string; offer: string[]; plan: "free"; }
export interface VendorAccountResult { user: PortalUser; }

export const SIMULATED_VENDOR_OTP = "123456";

export async function sendVendorOtp(_email: string): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));
}

export async function verifyVendorOtp(otp: string): Promise<boolean> {
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  return otp === SIMULATED_VENDOR_OTP;
}

// Creates the real WordPress authentication user after email verification.
export async function registerVendorAccount(account: VendorAccountData): Promise<VendorAccountResult> {
  const result = await registerUser({
    email: account.email,
    first_name: account.name,
    password: account.password,
    phone: account.phone,
    account_type: account.account_type,
  });
  if (!result.user?.id) throw new Error("WordPress did not return a user ID.");
  const accountType = result.user.account_type === "business" ? "business" : account.account_type;
  localStorage.setItem("vendorUserID", String(result.user.id));
  localStorage.setItem("userID", String(result.user.id));
  localStorage.setItem("accountType", accountType);
  const authenticatedUser = await loginPartner(account.email, account.password);
  return { user: { ...authenticatedUser, account_type: authenticatedUser.account_type || accountType } };
}

// Temporary Vendor CPT adapter. Replace this body with the real Vendor profile REST call.
export async function registerVendorProfile(userId: string, profile: VendorProfileData): Promise<{ vendorId: string }> {
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  sessionStorage.setItem("vendorProfile", JSON.stringify({
    ...profile,
    wordpress_user_id: userId,
    cover_image: { name: profile.cover_image.name, type: profile.cover_image.type, size: profile.cover_image.size },
  }));
  return { vendorId: `mock-profile-${Date.now()}` };
}
