import { apiClient as adminClient } from "./client";

const requester = () => ({ requester_email: sessionStorage.getItem("userEmail") || "", requester_type: "administrator" });

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  roles: string[];
  account_type: string;
  profile_status: "active" | "inactive";
  product_count: number;
}

export interface UsersResult {
  users: AdminUser[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface UserFilters { search?: string; role?: string; status?: string; page: number; per_page: number }

const toUser = (value: Record<string, unknown>): AdminUser => ({
  id: Number(value.id ?? value.user_id),
  email: String(value.email ?? ""),
  name: String(value.name ?? value.display_name ?? value.first_name ?? value.email ?? "Unknown user"),
  roles: Array.isArray(value.roles) ? value.roles.map(String) : value.role ? [String(value.role)] : [],
  account_type: String(value.account_type ?? "—"),
  profile_status: value.profile_status === "inactive" ? "inactive" : "active",
  product_count: Number(value.product_count ?? 0),
});

export async function fetchAdminUsers(filters: UserFilters): Promise<UsersResult> {
  const response = await adminClient.get("/admin-users", { params: { ...filters, ...requester() } });
  const body = response.data ?? {};
  const rawUsers = Array.isArray(body) ? body : body.users ?? body.data ?? [];
  const pagination = body.pagination ?? body.meta ?? body;
  const total = Number(pagination.total ?? pagination.total_users ?? rawUsers.length);
  const perPage = Number(pagination.per_page ?? filters.per_page);
  return {
    users: rawUsers.map((user: Record<string, unknown>) => toUser(user)),
    page: Number(pagination.page ?? pagination.current_page ?? filters.page),
    per_page: perPage,
    total,
    total_pages: Number(pagination.total_pages ?? pagination.pages ?? Math.max(1, Math.ceil(total / perPage))),
  };
}

export async function updateAdminUserStatus(user: Pick<AdminUser, "id" | "email">, status: "active" | "inactive") {
  return (await adminClient.post("/admin-user-status", { ...requester(), target_user_id: user.id || undefined, target_email: user.id ? undefined : user.email, status })).data;
}

export interface AdminProduct {
  id: number;
  title: string;
  price: string;
  sku: string;
  image: string;
  status: "publish" | "draft" | "trash" | string;
}

export async function fetchAdminUserProducts(email: string): Promise<AdminProduct[]> {
  const response = await adminClient.get("/admin-user-products", { params: { email, ...requester() } });
  return response.data.map((item: Record<string, unknown>) => ({
    id: Number(item.id ?? item.product_id),
    title: String(item.title ?? item.name ?? "Untitled product"),
    price: String(item.price ?? "—"),
    sku: String(item.sku ?? "—"),
    image: String(item.image ?? item.thumbnail ?? item.image_url ?? ""),
    status: String(item.status ?? item.post_status ?? "draft"),
  }));
}

export async function updateAdminProductStatus(productId: number, status: "publish" | "draft" | "trash") {
  return (await adminClient.post("/admin-product-status", { ...requester(), product_id: productId, status })).data;
}
