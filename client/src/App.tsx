import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { RequireAdmin } from "./components/RequireAdmin";
import { RequireAuth } from "./components/RequireAuth";
import { AdminUserEditPage } from "./pages/AdminUserEditPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { LoginPage } from "./pages/LoginPage";
import { GroceriesPage } from "./pages/GroceriesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RootRedirect } from "./pages/RootRedirect";
import { useAuthStore } from "./stores/authStore";

function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);
  return <AppRoutes />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/groceries" element={<GroceriesPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <AdminUsersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <RequireAdmin>
                <AdminUserEditPage />
              </RequireAdmin>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
