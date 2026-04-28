import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">Groceries</div>
        <nav className="app-nav" aria-label="Account">
          <span className="greeting">Hi, {user.name}</span>
          <NavLink to="/groceries" end>
            Groceries
          </NavLink>
          <NavLink to="/account/profile" end>
            Profile
          </NavLink>
          {user.role === "admin" ? (
            <NavLink to="/admin/users">Users</NavLink>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
