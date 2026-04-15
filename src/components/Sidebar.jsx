import { NavLink } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useApp } from "../context/AppContext";
import "./Sidebar.css";

const links = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", end: true },
  { to: ROUTES.BOARD, label: "Board" },
  { to: ROUTES.MEMBERS, label: "Members" },
  { to: ROUTES.CALENDAR, label: "Calendar" },
  { to: ROUTES.TABLE, label: "Table" },
  { to: ROUTES.SETTINGS, label: "Settings" }
];

export default function Sidebar() {
  const {
    boards,
    activeBoardId,
    setActiveBoardId,
    createBoard,
    logout,
    authUser
  } = useApp();

  const handleCreateBoard = async () => {
    const name = window.prompt("Enter board name");
    if (!name) return;
    await createBoard({ name: name.trim() });
  };

  const isAdmin = authUser?.role === "admin";

  return (
    <aside className="sidebar">
      <div className="workspace-title">Workspace</div>

      <div className="board-switcher">
        <select
          value={activeBoardId}
          onChange={(event) => setActiveBoardId(event.target.value)}
        >
          {boards.map((board) => (
            <option key={board._id} value={board._id}>
              {board.name}
            </option>
          ))}
        </select>
        <button onClick={handleCreateBoard}>+ Board</button>
      </div>

      <nav className="sidebar-nav">
        {links
          .filter((link) => !(link.label === "Members" && !isAdmin))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
