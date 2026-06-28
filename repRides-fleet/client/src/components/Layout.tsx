import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Car, Users, CalendarClock, BellRing, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { clearOwnerToken } from "@/lib/auth";

const nav = [
  { to: "/fleet", label: "Fleet", icon: Car },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/rentals", label: "Rentals", icon: CalendarClock },
  { to: "/due-soon", label: "Due soon", icon: BellRing },
];

export function Layout() {
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await api.admin.logout();
    } catch {
      // ignore — we're clearing the token locally either way
    }
    clearOwnerToken();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full">
      <aside className="w-56 border-r border-zinc-200 bg-white p-4 flex flex-col gap-1">
        <div className="px-2 py-3 mb-2">
          <div className="text-lg font-semibold text-zinc-900">ReputableRides</div>
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
        <div className="mt-auto pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
