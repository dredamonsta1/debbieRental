import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, Car, User, Undo2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Vehicle, Customer, Rental } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Window = "24h" | "48h" | "7d";
const windows: { id: Window; label: string; hours: number }[] = [
  { id: "24h", label: "Next 24 hours", hours: 24 },
  { id: "48h", label: "Next 48 hours", hours: 48 },
  { id: "7d", label: "Next 7 days", hours: 24 * 7 },
];

function formatRelative(due: Date, now: Date) {
  const diffMs = due.getTime() - now.getTime();
  const absHours = Math.abs(diffMs) / (1000 * 60 * 60);
  const overdue = diffMs < 0;

  let value: string;
  if (absHours < 1) {
    const mins = Math.max(1, Math.round(Math.abs(diffMs) / 60000));
    value = `${mins} min`;
  } else if (absHours < 48) {
    value = `${Math.round(absHours)}h`;
  } else {
    value = `${Math.round(absHours / 24)}d`;
  }

  return overdue ? `${value} overdue` : `Due in ${value}`;
}

function fmtDue(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DueSoonPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowId, setWindowId] = useState<Window>("7d");
  const [now, setNow] = useState(() => new Date());

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
      setNow(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const { overdue, dueSoon } = useMemo(() => {
    const hours = windows.find((w) => w.id === windowId)!.hours;
    const cutoffMs = now.getTime() + hours * 60 * 60 * 1000;
    const open = rentals.filter((r) => r.returned_at === null);

    const overdue = open
      .filter((r) => Date.parse(r.due_at) < now.getTime())
      .sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at));

    const dueSoon = open
      .filter((r) => {
        const due = Date.parse(r.due_at);
        return due >= now.getTime() && due <= cutoffMs;
      })
      .sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at));

    return { overdue, dueSoon };
  }, [rentals, windowId, now]);

  async function handleReturn(id: string) {
    try {
      await api.rentals.return(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to return rental");
    }
  }

  function renderCard(r: Rental, urgent: boolean) {
    const vehicle = vehicleById.get(r.vehicle_id);
    const customer = customerById.get(r.customer_id);
    const due = new Date(r.due_at);
    return (
      <Card key={r.id} className={cn(urgent && "border-red-300")}>
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
            <Badge variant={urgent ? "overdue" : "scheduled"}>
              {formatRelative(due, now)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{fmtDue(r.due_at)}</span>
          </div>
          {r.notes && <div className="text-xs text-zinc-500 italic">{r.notes}</div>}
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => handleReturn(r.id)}>
              <Undo2 className="h-3.5 w-3.5" /> Mark returned
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Due soon</h1>
          <p className="text-sm text-zinc-500">Rentals to follow up on</p>
        </div>
        <div className="flex gap-1 rounded-md border border-zinc-200 bg-white p-1">
          {windows.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWindowId(w.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                windowId === w.id
                  ? "bg-brand text-brand-foreground"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-zinc-500">Loading…</div>
      ) : overdue.length === 0 && dueSoon.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          All clear. No rentals overdue or due in the selected window.
        </div>
      ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  Overdue ({overdue.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdue.map((r) => renderCard(r, true))}
              </div>
            </section>
          )}

          {dueSoon.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-700">
                <Clock className="h-4 w-4" />
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  Due soon ({dueSoon.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueSoon.map((r) => renderCard(r, false))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
