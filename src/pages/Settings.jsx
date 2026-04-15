import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import "./Settings.css";

export default function Settings() {
  const { authUser, theme, toggleTheme } = useApp();

  const initials = useMemo(() => {
    if (!authUser?.name) return "U";
    return authUser.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [authUser]);

  return (
    <section className="settings-page">
      <header className="settings-head">
        <h1>Settings</h1>
        <p>Manage profile and appearance preferences.</p>
      </header>

      <div className="settings-grid">
        <article className="settings-card">
          <h3>Profile</h3>
          <div className="profile-row">
            <span className="profile-avatar">{initials}</span>
            <div>
              <p>{authUser?.name || "User"}</p>
              <small>{authUser?.email || "-"}</small>
            </div>
          </div>
        </article>

        <article className="settings-card">
          <h3>Theme</h3>
          <p className="theme-label">Current: {theme}</p>
          <button className="theme-btn" onClick={toggleTheme}>
            Toggle Theme
          </button>
        </article>
      </div>
    </section>
  );
}