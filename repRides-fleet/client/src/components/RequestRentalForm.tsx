import { useEffect, useState } from "react";
import { Car, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RequestRentalForm() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    vehicle_id: "",
    start_at: toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    due_at: toLocalInput(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
    notes: "",
  }));

  useEffect(() => {
    api.public
      .listAvailableVehicles()
      .then((vs) => {
        setVehicles(vs);
        if (vs.length > 0) setForm((f) => (f.vehicle_id ? f : { ...f, vehicle_id: vs[0].id }));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const startIso = new Date(form.start_at).toISOString();
      const dueIso = new Date(form.due_at).toISOString();
      if (Date.parse(dueIso) <= Date.parse(startIso)) {
        throw new Error("Return date must be after pickup date");
      }
      const res = await api.public.requestRental({
        customer: {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          license_number: form.license_number || undefined,
        },
        vehicle_id: form.vehicle_id,
        start_at: startIso,
        due_at: dueIso,
        notes: form.notes || undefined,
      });
      setConfirmed(res.rental.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-md text-center space-y-4 py-6">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold">Request received</h3>
        <p className="text-zinc-600">
          We'll confirm your pickup shortly. Reference: <span className="font-mono">{confirmed.slice(0, 8)}</span>
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Make another request
        </Button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-sm text-zinc-500 py-8">Loading available cars…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {vehicles.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Pick a vehicle
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vehicles.map((v) => {
              const selected = form.vehicle_id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setForm({ ...form, vehicle_id: v.id })}
                  className={cn(
                    "text-left rounded-md border-2 p-4 transition-colors",
                    selected
                      ? "border-black bg-brand/20"
                      : "border-zinc-200 hover:border-zinc-400"
                  )}
                >
                  <div className="flex items-center gap-2 font-semibold text-zinc-900">
                    <Car className="h-4 w-4" />
                    {v.make} {v.model}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {v.year} · plate {v.plate}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {vehicles.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No cars available right now. Submit your request anyway and we'll reach out.
        </div>
      )}

      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Your info
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="license_number">Driver's license #</Label>
            <Input
              id="license_number"
              value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Pickup & return
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start_at">Pickup *</Label>
            <Input
              id="start_at"
              type="datetime-local"
              required
              value={form.start_at}
              onChange={(e) => setForm({ ...form, start_at: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_at">Return by *</Label>
            <Input
              id="due_at"
              type="datetime-local"
              required
              value={form.due_at}
              onChange={(e) => setForm({ ...form, due_at: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Anything we should know? (optional)</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
      </section>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-black text-white hover:bg-zinc-800 h-12 text-base font-semibold"
      >
        {submitting ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
