import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

export default function Navbar() {
  const { authUser, activity, globalSearch, setGlobalSearch } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

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
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">TaskFlow</span>
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search tasks, members..."
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper">
          <button
            className="icon-btn"
            aria-label="notifications"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            🔔
          </button>
          {showNotifications ? (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              <ul>
                {activity.length === 0 ? <li>No recent activity</li> : null}
                {activity.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="profile-chip">
          <span className="avatar">{initials}</span>
          <span className="name">{authUser?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}