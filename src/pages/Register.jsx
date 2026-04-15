import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, authLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Create account</h1>
        <p>Register to start collaborating</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </label>

          {error ? <span className="register-error">{error}</span> : null}

          <button type="submit" disabled={authLoading}>
            {authLoading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="register-alt">
          Already have account? <Link to={ROUTES.LOGIN}>Login</Link>
        </p>
      </section>
    </main>
  );
}