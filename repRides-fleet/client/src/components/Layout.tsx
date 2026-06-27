import { NavLink, Outlet } from "react-router-dom";
import { Car, Users, CalendarClock, BellRing } from "lucide-react";
import { cn } from "@/lib/cn";

const nav = [
  { to: "/fleet", label: "Fleet", icon: Car },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/rentals", label: "Rentals", icon: CalendarClock },
  { to: "/due-soon", label: "Due soon", icon: BellRing },
];

export function Layout() {
  return (
    <div className="flex h-full">
      <aside className="w-56 border-r border-zinc-200 bg-white p-4 flex flex-col gap-1">
        <div className="px-2 py-3 mb-2">
          <div className="text-lg font-semibold text-zinc-900">repRides</div>
          <div className="text-xs text-zinc-500">Fleet manager</div>
        </div>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand text-brand-foreground" : "text-zinc-600 hover:bg-zinc-100"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
