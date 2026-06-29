import { useEffect, useState } from "react";
import { Car, Users, Cog } from "lucide-react";
import { api } from "@/lib/api";
import type { Vehicle } from "@/types";

interface FleetShowcaseProps {
  onPick: (vehicleId: string) => void;
}

export function FleetShowcase({ onPick }: FleetShowcaseProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.public
      .listAvailableVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-sm text-zinc-500">Loading available vehicles…</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        Fleet listing coming soon. Submit a request below and we'll match you with a vehicle.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((v) => {
        const features = v.features
          ? v.features.split(",").map((f) => f.trim()).filter(Boolean)
          : [];
        return (
          <article
            key={v.id}
            className="bg-white border-2 border-zinc-200 rounded-sm overflow-hidden flex flex-col"
          >
            <div className="aspect-[16/10] bg-zinc-100 overflow-hidden">
              {v.photo_url ? (
                <img
                  src={v.photo_url}
                  alt={`${v.make} ${v.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-zinc-300">
                  <Car className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight leading-tight">
                  {v.make} {v.model}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{v.year}</p>
              </div>

              {(v.seats !== null || v.transmission) && (
                <div className="flex gap-4 text-sm text-zinc-700">
                  {v.seats !== null && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-zinc-400" />
                      <span>{v.seats} seats</span>
                    </div>
                  )}
                  {v.transmission && (
                    <div className="flex items-center gap-1.5">
                      <Cog className="h-4 w-4 text-zinc-400" />
                      <span className="capitalize">{v.transmission}</span>
                    </div>
                  )}
                </div>
              )}

              {features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {features.map((f) => (
                    <span
                      key={f}
                      className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-zinc-100 flex items-end justify-between gap-3">
                <div>
                  {v.daily_rate !== null ? (
                    <>
                      <div className="text-xs text-zinc-500 uppercase tracking-wide">From</div>
                      <div className="text-2xl font-black leading-none">
                        ${v.daily_rate}
                        <span className="text-sm font-bold text-zinc-500">/day</span>
                      </div>
                      {v.weekly_rate !== null && (
                        <div className="text-xs text-zinc-500 mt-0.5">${v.weekly_rate}/week</div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-zinc-500">Contact for pricing</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onPick(v.id)}
                  className="bg-black text-white px-4 h-10 font-bold uppercase tracking-wide text-xs hover:bg-zinc-800 transition whitespace-nowrap"
                >
                  Request this car
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
