import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, authLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome back</h1>
        <p>Login to your workspace</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error ? <span className="auth-error">{error}</span> : null}

          <button type="submit" disabled={authLoading}>
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-alt">
          No account? <Link to={ROUTES.REGISTER}>Create one</Link>
        </p>
      </section>
    </main>
  );
}