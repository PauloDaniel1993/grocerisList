import { useEffect, useState, type FormEvent } from "react";
import * as api from "../api/client";
import { ErrorText } from "../components/ErrorText";
import { useAuthStore } from "../stores/authStore";

const successId = "profile-success";
const formErrorId = "profile-form-error";
const nameErrorId = "profile-name-error";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    setFormError(null);
    setSuccess(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.patchMe(trimmed);
      setUser(updated);
      setSuccess("Profile saved");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save your profile"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <h1>Profile</h1>
      <form
        onSubmit={onSubmit}
        aria-describedby={
          [successId, formErrorId].filter(Boolean).join(" ") || undefined
        }
      >
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={user.email}
            readOnly
            aria-readonly
          />
        </div>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? nameErrorId : undefined}
          />
          <ErrorText id={nameErrorId} message={nameError} />
        </div>
        {success ? (
          <p id={successId} className="success" role="status">
            {success}
          </p>
        ) : null}
        <ErrorText id={formErrorId} message={formError} />
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving" : "Save"}
        </button>
      </form>
    </div>
  );
}
