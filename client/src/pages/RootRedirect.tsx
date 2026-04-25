import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  if (status === "loading") {
    return <p>Loading</p>;
  }
  if (user) {
    return <Navigate to="/account/profile" replace />;
  }
  return <Navigate to="/login" replace />;
}
