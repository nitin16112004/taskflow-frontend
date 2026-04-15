import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { ROUTES } from "./utils/constants";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Members from "./pages/Members";
import Calendar from "./pages/Calendar";
import TableView from "./pages/TableView";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function ProtectedLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return children;
}

export default function App() {
  const { theme } = useApp();

  return (
    <div className={theme === "dark" ? "theme-dark" : ""}>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BOARD}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Board />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MEMBERS}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Members />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CALENDAR}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Calendar />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TABLE}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TableView />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </div>
  );
}