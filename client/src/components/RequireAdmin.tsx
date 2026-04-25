import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type RequireAdminProps = { children: ReactNode };

export function RequireAdmin({ children }: RequireAdminProps) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== "admin") {
    return <Navigate to="/account/profile" replace />;
  }
  return <>{children}</>;
}
