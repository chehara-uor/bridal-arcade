import type { PortalUser } from "../api/portal";

export type AccountType = "individual" | "business";

const ACCOUNT_TYPE_KEY = "accountType";
const MOCK_USER_KEY = "vendorRegistrationUser";

export function normalizeAccountType(value: unknown): AccountType {
  return value === "business" || value === "vendor" ? "business" : "individual";
}

export function getStoredAccountType(): AccountType {
  return normalizeAccountType(sessionStorage.getItem(ACCOUNT_TYPE_KEY) || localStorage.getItem(ACCOUNT_TYPE_KEY));
}

export function setStoredAccountType(accountType: AccountType) {
  sessionStorage.setItem(ACCOUNT_TYPE_KEY, accountType);
  localStorage.setItem(ACCOUNT_TYPE_KEY, accountType);
}

export function dashboardFor(accountType: AccountType): string {
  return accountType === "business" ? "/vendor/dashboard" : "/bride/dashboard";
}

export function isAdministrator(user: Pick<PortalUser, "roles" | "role">): boolean {
  return user.role === "administrator" || (Array.isArray(user.roles) && user.roles.includes("administrator"));
}

export function landingPageFor(user: PortalUser): string {
  return isAdministrator(user) ? "/admin/dashboard" : dashboardFor(normalizeAccountType(user.account_type));
}

export function storeMockVendorUser(user: PortalUser) {
  sessionStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  setStoredAccountType("business");
}

export function getMockVendorUser(): PortalUser | null {
  const stored = sessionStorage.getItem(MOCK_USER_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored) as PortalUser;
    return user?.id && user?.email ? user : null;
  } catch {
    sessionStorage.removeItem(MOCK_USER_KEY);
    return null;
  }
}

export function clearMockVendorUser() {
  sessionStorage.removeItem(MOCK_USER_KEY);
}
