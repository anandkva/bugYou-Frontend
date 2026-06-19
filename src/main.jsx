import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BarChart3,
  Bug,
  ClipboardList,
  LogOut,
  Plus,
  Search,
  UserCheck,
  UserCog,
} from "lucide-react";
import { onAuthExpired } from "./api/client";
import { AppMetaFooter, BrandName } from "./components";
import { AuthScreen } from "./pages/AuthPage";
import { BugManagement } from "./pages/BugManagement";
import { DeveloperDashboard } from "./pages/DeveloperDashboard";
import { DocsPage } from "./pages/DocsPage";
import { ManageDevelopers } from "./pages/ManageDevelopers";
import { MyIssues } from "./pages/MyIssues";
import { MyTasksView } from "./pages/MyTasksView";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ReportIssue } from "./pages/ReportIssue";
import { TrackTicket } from "./pages/TrackTicket";
import "./styles.css";

const roleHome = {
  admin: "/dashboard",
  developer: "/my-tasks",
  user: "/report",
};

const navByRole = {
  admin: [
    ["/dashboard", "Dashboard", BarChart3],
    ["/my-tasks", "My Tasks", UserCheck],
    ["/manage", "All Tasks", ClipboardList],
    ["/manage-devs", "Manage Devs", UserCog],
    ["/track", "Track Ticket", Search],
  ],
  developer: [
    ["/dashboard", "Dashboard", BarChart3],
    ["/my-tasks", "My Tasks", UserCheck],
    ["/manage", "Bug Management", ClipboardList],
    ["/track", "Track Ticket", Search],
  ],
  user: [
    ["/my-tickets", "My Tickets", ClipboardList],
    ["/report", "Report Issue", Plus],
    ["/track", "Track Ticket", Search],
  ],
};

/* ─── App ─────────────────────────────────────────────────────────────────── */

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("bugyou-session");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session)
      localStorage.setItem("bugyou-session", JSON.stringify(session));
    else localStorage.removeItem("bugyou-session");
  }, [session]);

  useEffect(() => onAuthExpired(() => setSession(null)), []);

  return <AppRoutes session={session} setSession={setSession} />;
}

function AppRoutes({ session, setSession }) {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={defaultPath(session)} replace />}
      />
      <Route
        path="/login"
        element={<PublicRoute session={session} setSession={setSession} />}
      />
      <Route path="/docs" element={<DocsPage />} />
      <Route
        path="/my-issues"
        element={<Navigate to="/my-tickets" replace />}
      />

      <Route
        element={<ProtectedShell session={session} setSession={setSession} />}
      >
        <Route
          path="/report"
          element={
            <RoleRoute session={session} roles={["user"]}>
              <ReportIssue token={session?.token} />
            </RoleRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <RoleRoute session={session} roles={["user"]}>
              <MyIssues token={session?.token} />
            </RoleRoute>
          }
        />
        <Route
          path="/track"
          element={
            <RoleRoute session={session} roles={["user", "developer", "admin"]}>
              <TrackTicket token={session?.token} />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RoleRoute session={session} roles={["developer", "admin"]}>
              <DeveloperDashboard token={session?.token} />
            </RoleRoute>
          }
        />
        <Route
          path="/manage"
          element={
            <RoleRoute session={session} roles={["developer", "admin"]}>
              <BugManagement token={session?.token} session={session} />
            </RoleRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <RoleRoute session={session} roles={["developer", "admin"]}>
              <MyTasksView token={session?.token} session={session} />
            </RoleRoute>
          }
        />
        <Route
          path="/manage-devs"
          element={
            <RoleRoute session={session} roles={["admin"]}>
              <ManageDevelopers token={session?.token} />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage homePath={defaultPath(session)} />} />
    </Routes>
  );
}

function PublicRoute({ session, setSession }) {
  const navigate = useNavigate();
  if (session) return <Navigate to={defaultPath(session)} replace />;
  return <AuthScreen onSession={setSession} onDocs={() => navigate("/docs")} />;
}

function ProtectedShell({ session, setSession }) {
  const location = useLocation();
  if (!session)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const role = session.user.role;
  const navItems = navByRole[role] || navByRole.user;

  return (
    <div className="app-shell">
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Bug size={20} />
          </span>
          <div>
            <BrandName />
            <small>Issue tracking</small>
          </div>
        </div>
        <nav>
          {navItems.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="profile">
          <span>{session.user.name}</span>
          <small>{session.user.role}</small>
          <button
            className="icon-button"
            onClick={() => setSession(null)}
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ── Mobile top header ─────────────────────────────────────────── */}
      <header className="mobile-header">
        <div className="brand mobile-brand">
          <span className="brand-mark brand-mark-sm">
            <Bug size={16} />
          </span>
          <BrandName />
        </div>
        <div className="mobile-header-right">
          <span className="mobile-user-chip">
            {session.user.name[0]?.toUpperCase()}
          </span>
          <button
            className="icon-button"
            onClick={() => setSession(null)}
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="content">
        <Outlet />
        <AppMetaFooter />
      </main>

      {/* ── Mobile bottom navigation ──────────────────────────────────── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? " active" : ""}`
            }
            aria-label={label}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function RoleRoute({ session, roles, children }) {
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.user.role))
    return <Navigate to={defaultPath(session)} replace />;
  return children;
}

function defaultPath(session) {
  return roleHome[session?.user?.role] || "/login";
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
