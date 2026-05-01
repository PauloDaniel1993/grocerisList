import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  if (status === "loading") {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="flex min-h-svh items-center justify-center"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/grocery-lists" replace />;
  }
  return <Navigate to="/login" replace />;
}
