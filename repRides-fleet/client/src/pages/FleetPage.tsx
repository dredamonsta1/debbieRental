import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const emptyForm = {
  make: "",
  model: "",
  year: "",
  plate: "",
  photo_url: "",
  seats: "",
  transmission: "",
  features: "",
  daily_rate: "",
  weekly_rate: "",
};

export function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setVehicles(await api.vehicles.list());
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.vehicles.create({
        make: form.make,
        model: form.model,
        year: Number(form.year),
        plate: form.plate,
        photo_url: form.photo_url || null,
        seats: form.seats ? Number(form.seats) : null,
        transmission: form.transmission || null,
        features: form.features || null,
        daily_rate: form.daily_rate ? Number(form.daily_rate) : null,
        weekly_rate: form.weekly_rate ? Number(form.weekly_rate) : null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this vehicle from the fleet?")) return;
    try {
      await api.vehicles.delete(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Fleet</h1>
          <p className="text-sm text-zinc-500">Cars available for rental</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add vehicle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New vehicle</CardTitle>
            <CardDescription>Add a car to the fleet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  required
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plate">License plate</Label>
                <Input
                  id="plate"
                  required
                  value={form.plate}
                  onChange={(e) => setForm({ ...form, plate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  type="url"
                  placeholder="https://… (Imgur, Cloudinary, Google Photos, etc.)"
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transmission">Transmission</Label>
                <Input
                  id="transmission"
                  placeholder="automatic / manual"
                  value={form.transmission}
                  onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="features">Features</Label>
                <Input
                  id="features"
                  placeholder="AC, Bluetooth, Backup camera"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="daily_rate">Daily rate ($)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.daily_rate}
                  onChange={(e) => setForm({ ...form, daily_rate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weekly_rate">Weekly rate ($)</Label>
                <Input
                  id="weekly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.weekly_rate}
                  onChange={(e) => setForm({ ...form, weekly_rate: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding…" : "Add vehicle"}
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
      ) : vehicles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No vehicles yet. Add your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              {v.photo_url && (
                <div className="aspect-video bg-zinc-100">
                  <img
                    src={v.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {v.make} {v.model}
                    </CardTitle>
                    <CardDescription>
                      {v.year} · {v.plate}
                    </CardDescription>
                  </div>
                  <Badge variant={v.status}>{v.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-zinc-600">
                {(v.daily_rate !== null || v.weekly_rate !== null) && (
                  <div className="font-semibold text-zinc-900">
                    {v.daily_rate !== null && <>${v.daily_rate}/day</>}
                    {v.daily_rate !== null && v.weekly_rate !== null && " · "}
                    {v.weekly_rate !== null && <>${v.weekly_rate}/wk</>}
                  </div>
                )}
                {(v.seats !== null || v.transmission) && (
                  <div>
                    {v.seats !== null && `${v.seats} seats`}
                    {v.seats !== null && v.transmission && " · "}
                    {v.transmission}
                  </div>
                )}
                {v.features && <div className="text-zinc-500">{v.features}</div>}
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
