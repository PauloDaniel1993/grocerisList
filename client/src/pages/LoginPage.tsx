import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorText } from "../components/ErrorText";
import { useAuthStore } from "../stores/authStore";

const emailErrorId = "login-email-error";
const passErrorId = "login-pass-error";
const formErrorId = "login-form-error";

export function LoginPage() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)
    ?.from?.pathname;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "ready" && user) {
      navigate(from ?? "/account/profile", { replace: true });
    }
  }, [user, status, navigate, from]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPassError(null);
    const em = email.trim();
    if (!em) {
      setEmailError("Email is required");
    }
    if (!password) {
      setPassError("Password is required");
    }
    if (!em || !password) {
      return;
    }
    setSubmitting(true);
    try {
      await login(em, password);
      navigate(from ?? "/account/profile", { replace: true });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Invalid email or password"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <p>Loading</p>;
  }

  return (
    <div className="page page-narrow">
      <h1>Sign in</h1>
      <form
        onSubmit={onSubmit}
        aria-describedby={formError ? formErrorId : undefined}
        noValidate
      >
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? emailErrorId : undefined}
          />
          <ErrorText id={emailErrorId} message={emailError} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!passError}
            aria-describedby={passError ? passErrorId : undefined}
          />
          <ErrorText id={passErrorId} message={passError} />
        </div>
        <ErrorText id={formErrorId} message={formError} />
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
