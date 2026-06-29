export type VehicleStatus = "available" | "rented" | "maintenance";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  status: VehicleStatus;
  photo_url: string | null;
  seats: number | null;
  transmission: string | null;
  features: string | null;
  daily_rate: number | null;
  weekly_rate: number | null;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  created_at: string;
}

export type RentalStatus = "requested" | "scheduled" | "active" | "returned" | "overdue";

export interface Rental {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_at: string;
  due_at: string;
  returned_at: string | null;
  status: RentalStatus;
  notes: string | null;
  created_at: string;
}
