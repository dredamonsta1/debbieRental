import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getOwnerToken } from "@/lib/auth";

export function ProtectedRoute() {
  const location = useLocation();
  const token = getOwnerToken();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
