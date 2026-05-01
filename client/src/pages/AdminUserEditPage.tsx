import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../api/client";
import { ErrorText } from "../components/ErrorText";

const errId = "admin-edit-error";

export function AdminUserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const u = await api.getAdminUser(userId);
        if (!cancelled) {
          setName(u.name);
          setRole(u.role);
        }
      } catch (e) {
        if (!cancelled) {
          setFormError(
            e instanceof Error ? e.message : "Could not load this user"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) {
      return;
    }
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      await api.patchAdminUser(userId, { name: trimmed, role });
      navigate("/admin/users");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading</p>;
  }

  return (
    <div className="page page-narrow">
      <h1>Edit user</h1>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <fieldset>
          <legend>Role</legend>
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            User
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
            />
            Admin
          </label>
        </fieldset>
        <ErrorText id={errId} message={formError} />
        <div className="row">
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
