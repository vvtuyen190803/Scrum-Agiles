import "antd/dist/reset.css";
import "./index.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./hooks/useAuth";
import "./App.css";
import { getCurrentUser } from "./utils/storage";
const getInitials = (value) => {
  if (!value) return "ND";
  const parts = String(value).trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "ND";
};
const getInitialTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
function AuthenticatedShell({ theme, onToggleTheme }) {
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const sidebarUser = useMemo(() => {
    const name = currentUser?.username || currentUser?.email || "Nguoi dung";
    const groups = Array.isArray(currentUser?.groups) ? currentUser.groups : [];
    const role = groups[0] || "Nguoi dung";
    return {
      initials: getInitials(name),
      name,
      role,
    };
  }, [currentUser]);

  return (
    <div className="app-shell">
      <Sidebar
        brand="TaskFlow"
        user={sidebarUser}
        navItems={[
          {
            id: "dashboard",
            label: "Dashboard",
            to: "/dashboard",
            icon: "dashboard",
          },
          { id: "tasks", label: "Công việc", to: "/api/task", icon: "tasks" },
          { id: "users", label: "Người dùng", to: "/users", icon: "users" },
          {
            id: "settings",
            label: "Cài đặt",
            to: "/profile",
            icon: "settings",
          },
        ]}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={logout}
      />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <AuthenticatedShell
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            }
          >
            <Route path="/api/task" element={<Tasks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route
              path="/profile"
              element={
                <Profile theme={theme} onToggleTheme={handleToggleTheme} />
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
