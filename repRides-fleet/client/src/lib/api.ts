import type { Vehicle, Customer, Rental } from "@/types";
import { getOwnerToken, clearOwnerToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getOwnerToken();
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Owner-Token": token } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401) {
    clearOwnerToken();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  vehicles: {
    list: (availableOnly?: boolean) =>
      request<Vehicle[]>(`/vehicles${availableOnly ? "?available=true" : ""}`),
    get: (id: string) => request<Vehicle>(`/vehicles/${id}`),
    create: (input: {
      make: string;
      model: string;
      year: number;
      plate: string;
      photo_url?: string | null;
      seats?: number | null;
      transmission?: string | null;
      features?: string | null;
      daily_rate?: number | null;
      weekly_rate?: number | null;
    }) =>
      request<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(input) }),
    updateStatus: (id: string, status: Vehicle["status"]) =>
      request<Vehicle>(`/vehicles/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) => request<void>(`/vehicles/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => request<Customer[]>("/customers"),
    create: (input: { name: string; email?: string; phone?: string; license_number?: string }) =>
      request<Customer>("/customers", { method: "POST", body: JSON.stringify(input) }),
  },
  rentals: {
    list: () => request<Rental[]>("/rentals"),
    dueSoon: (hours = 24) => request<Rental[]>(`/rentals/due-soon?hours=${hours}`),
    create: (input: {
      vehicle_id: string;
      customer_id: string;
      start_at: string;
      due_at: string;
      notes?: string;
    }) => request<Rental>("/rentals", { method: "POST", body: JSON.stringify(input) }),
    return: (id: string) => request<Rental>(`/rentals/${id}/return`, { method: "POST" }),
    approve: (id: string) => request<Rental>(`/rentals/${id}/approve`, { method: "POST" }),
    reject: (id: string) => request<void>(`/rentals/${id}/reject`, { method: "POST" }),
  },
  public: {
    listAvailableVehicles: () => request<Vehicle[]>("/public/vehicles"),
    requestRental: (input: {
      customer: { name: string; email?: string; phone?: string; license_number?: string };
      vehicle_id: string;
      start_at: string;
      due_at: string;
      notes?: string;
    }) =>
      request<{ rental: Rental; customer: Customer }>("/public/rentals/request", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  admin: {
    login: (password: string) =>
      request<{ token: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
    logout: () => request<void>("/admin/logout", { method: "POST" }),
    checkSession: () => request<{ ok: true }>("/admin/session"),
  },
};
