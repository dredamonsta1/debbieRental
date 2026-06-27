import { useEffect, useMemo, useState } from "react";
import { Plus, Car, User, CalendarDays, Undo2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Vehicle, Customer, Rental } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart() {
  return toLocalInput(new Date());
}

function defaultDue() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return toLocalInput(d);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const emptyForm = () => ({
  vehicle_id: "",
  customer_id: "",
  start_at: defaultStart(),
  due_at: defaultDue(),
  notes: "",
});

export function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [r, v, c] = await Promise.all([
        api.rentals.list(),
        api.vehicles.list(),
        api.customers.list(),
      ]);
      setRentals(r);
      setVehicles(v);
      setCustomers(c);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "available"),
    [vehicles]
  );

  function openForm() {
    setForm(emptyForm());
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startIso = new Date(form.start_at).toISOString();
      const dueIso = new Date(form.due_at).toISOString();
      if (Date.parse(dueIso) <= Date.parse(startIso)) {
        throw new Error("Due date must be after start date");
      }
      await api.rentals.create({
        vehicle_id: form.vehicle_id,
        customer_id: form.customer_id,
        start_at: startIso,
        due_at: dueIso,
        notes: form.notes || undefined,
      });
      setShowForm(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to schedule rental");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReturn(id: string) {
    try {
      await api.rentals.return(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to return rental");
    }
  }

  const canSchedule = availableVehicles.length > 0 && customers.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Rentals</h1>
          <p className="text-sm text-zinc-500">Schedule, track, and return rentals</p>
        </div>
        <Button onClick={() => (showForm ? setShowForm(false) : openForm())} disabled={!canSchedule}>
          <Plus className="h-4 w-4" /> Schedule rental
        </Button>
      </div>

      {!canSchedule && !loading && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {availableVehicles.length === 0
            ? "No available vehicles. Add one in Fleet."
            : "No customers yet. Add one in Customers."}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New rental</CardTitle>
            <CardDescription>Pick a vehicle and customer, then set the dates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="vehicle_id">Vehicle</Label>
                <Select
                  id="vehicle_id"
                  required
                  value={form.vehicle_id}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                >
                  <option value="">Pick a vehicle…</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.plate})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_id">Customer</Label>
                <Select
                  id="customer_id"
                  required
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                >
                  <option value="">Pick a customer…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start_at">Start</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  required
                  value={form.start_at}
                  onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due_at">Due back</Label>
                <Input
                  id="due_at"
                  type="datetime-local"
                  required
                  value={form.due_at}
                  onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Scheduling…" : "Schedule rental"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-zinc-500">Loading…</div>
      ) : rentals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No rentals yet. Schedule one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentals.map((r) => {
            const vehicle = vehicleById.get(r.vehicle_id);
            const customer = customerById.get(r.customer_id);
            const open = r.status === "scheduled" || r.status === "active" || r.status === "overdue";
            return (
              <Card key={r.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-zinc-400" />
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle missing"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="h-3.5 w-3.5" />
                        {customer?.name ?? "Customer missing"}
                      </CardDescription>
                    </div>
                    <Badge variant={r.status}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      {fmtDate(r.start_at)} → {fmtDate(r.due_at)}
                    </span>
                  </div>
                  {r.returned_at && (
                    <div className="text-xs text-zinc-500">
                      Returned {fmtDate(r.returned_at)}
                    </div>
                  )}
                  {r.notes && <div className="text-xs text-zinc-500 italic">{r.notes}</div>}
                  {open && (
                    <div className="flex justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleReturn(r.id)}>
                        <Undo2 className="h-3.5 w-3.5" /> Mark returned
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
