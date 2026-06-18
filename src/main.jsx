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
  AlertCircle,
  BarChart3,
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  Frown,
  Home,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  Smile,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  XCircle,
} from "lucide-react";
import "./styles.css";

const API_URL = "http://localhost:8081";

const products = [
  "ZenClass",
  "Classify",
  "Hyernet",
  "PlacementInfo",
  "GuviPortal",
  "Other",
];
const categories = [
  "UI",
  "Backend/API",
  "Login/Auth",
  "Payment",
  "Performance",
  "Data Issue",
  "New Requirement",
  "Other",
];
const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Open", "On Hold", "Resolved", "Rejected"];
const devices = [
  "Chrome on Mac",
  "Chrome on Windows",
  "Chrome on Android",
  "Safari on iPhone",
  "Safari on Mac",
  "Firefox",
  "Edge",
  "Mobile App",
  "Other",
];

const CONTACT_EMAIL = "anand@guvi.in";
const BETA_VERSION = "1.2";

const roleHome = {
  admin: "/dashboard",
  developer: "/my-tasks",
  user: "/report",
};

const navByRole = {
  admin: [
    ["/dashboard", "Dashboard", BarChart3],
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
            <RoleRoute session={session} roles={["developer"]}>
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

      <Route path="*" element={<NotFoundPage session={session} />} />
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

/* ─── Auth ────────────────────────────────────────────────────────────────── */

function AuthScreen({ onSession, onDocs }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: false,
  });

  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, error: "", success: false });
    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "user",
          };

    try {
      const data = await api(endpoint, { method: "POST", body: payload });
      setState({ loading: false, error: "", success: true });
      onSession(data);
    } catch (error) {
      setState({ loading: false, error: error.message, success: false });
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-stack">
        <section className="auth-panel">
          <div className="brand auth-brand">
            <span className="brand-mark">
              <Bug size={22} />
            </span>
            <div>
              <BrandName />
              <small>Calm issue care portal</small>
            </div>
          </div>
          <form onSubmit={submit}>
            <div className="form-heading">
              <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
              <p>
                {mode === "login"
                  ? "Bring every product issue into one gentle, accountable place."
                  : "Start reporting issues with clear ticket tracking."}
              </p>
            </div>
            {mode === "register" && (
              <Field
                label="Name"
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
                required
              />
            )}
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(email) => setForm({ ...form, email })}
              required
            />
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(password) => setForm({ ...form, password })}
              required
            />
            {state.error && <Notice tone="error">{state.error}</Notice>}
            {state.success && (
              <Notice tone="success">
                Login complete. Opening your workspace.
              </Notice>
            )}
            <button className="primary-button" disabled={state.loading}>
              {state.loading && <LoaderCircle className="spin" size={18} />}
              {!state.loading && (mode === "login" ? "Sign in" : "Create user")}
              {state.loading &&
                (mode === "login" ? "Checking account" : "Creating user")}
            </button>
          </form>
          <button
            className="text-button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            <UserPlus size={16} />
            {mode === "login"
              ? "Create a user account"
              : "Already have an account"}
          </button>
          <button className="text-button muted" onClick={onDocs}>
            <BookOpen size={16} />
            View Portal Guide
          </button>
        </section>
        <AppMetaFooter />
      </div>
    </main>
  );
}

/* ─── Report Issue ────────────────────────────────────────────────────────── */

function ReportIssue({ token }) {
  const [form, setForm] = useState({
    type: "Bug",
    product: "ZenClass",
    title: "",
    description: "",
    category: "UI",
    priority: "Medium",
    attachmentUrl: "",
    browserDevice: "Chrome on Mac",
    deadline: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await api("/api/issues", {
        method: "POST",
        token,
        body: form,
      });
      setResult(data);
      setForm({
        ...form,
        title: "",
        description: "",
        attachmentUrl: "",
        deadline: "",
        stepsToReproduce: "",
        expectedResult: "",
        actualResult: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Report an Issue"
        subtitle="Create a bug or requirement with a generated ticket ID."
      />
      <form className="surface form-grid" onSubmit={submit}>
        <Select
          label="Issue Type"
          value={form.type}
          options={["Bug", "New Requirement"]}
          onChange={(type) => setForm({ ...form, type })}
        />
        <Select
          label="Product"
          value={form.product}
          options={products}
          onChange={(product) => setForm({ ...form, product })}
        />
        <Select
          label="Category"
          value={form.category}
          options={categories}
          onChange={(category) => setForm({ ...form, category })}
        />
        <Select
          label="Priority"
          value={form.priority}
          options={priorities}
          onChange={(priority) => setForm({ ...form, priority })}
        />
        <Select
          label="Browser / Device"
          value={form.browserDevice}
          options={devices}
          onChange={(browserDevice) => setForm({ ...form, browserDevice })}
        />
        <Field
          label="Deadline"
          type="date"
          value={form.deadline}
          onChange={(deadline) => setForm({ ...form, deadline })}
        />
        <Field
          label="Attachment URL"
          value={form.attachmentUrl}
          onChange={(attachmentUrl) => setForm({ ...form, attachmentUrl })}
          placeholder="Optional screenshot link or filename"
        />
        <Field
          label="Title"
          value={form.title}
          onChange={(title) => setForm({ ...form, title })}
          placeholder="Short issue summary"
          required
        />
        <TextArea
          label="Description"
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
          required
        />
        <TextArea
          label="Steps to Reproduce"
          value={form.stepsToReproduce}
          onChange={(stepsToReproduce) =>
            setForm({ ...form, stepsToReproduce })
          }
        />
        <TextArea
          label="Expected Result"
          value={form.expectedResult}
          onChange={(expectedResult) => setForm({ ...form, expectedResult })}
        />
        <TextArea
          label="Actual Result"
          value={form.actualResult}
          onChange={(actualResult) => setForm({ ...form, actualResult })}
        />
        {error && <Notice tone="error">{error}</Notice>}
        {result && (
          <Notice tone="success">
            Created successfully. Ticket ID:{" "}
            {displayTicketId(
              result.issue || { ...form, ticketId: result.ticketId },
            )}
          </Notice>
        )}
        <button className="primary-button" disabled={loading}>
          {loading && <LoaderCircle className="spin" size={18} />}
          {loading ? "Creating ticket" : "Submit Issue"}
        </button>
      </form>
    </section>
  );
}

/* ─── Track Ticket ────────────────────────────────────────────────────────── */

function TrackTicket({ token }) {
  const [ticketId, setTicketId] = useState("");
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function track(event) {
    event.preventDefault();
    setError("");
    setIssue(null);
    setLoading(true);
    try {
      const data = await api(`/api/issues/track/${backendTicketId(ticketId)}`, {
        token,
      });
      setIssue(data.issue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Track Ticket"
        subtitle="Look up status and latest developer comments."
      />
      <form className="surface search-row" onSubmit={track}>
        <Field
          label="Ticket ID"
          value={ticketId}
          onChange={setTicketId}
          placeholder="BUG-2026-001 or NR-2026-001"
          required
        />
        <button className="primary-button" disabled={loading}>
          {loading ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Search size={17} />
          )}
          {loading ? "Tracking" : "Track"}
        </button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      {issue && <IssueDetail issue={issue} audience="user" />}
    </section>
  );
}

/* ─── My Issues (user) ────────────────────────────────────────────────────── */

function MyIssues({ token }) {
  const { data, error, loading, reload } = useApi("/api/issues/my", token);
  return (
    <section>
      <PageHeader
        title="My Tickets"
        subtitle="Issues and requirements reported from your account."
        action={
          <button className="secondary-button" onClick={reload}>
            Refresh
          </button>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <LoadingPanel label="Loading your tickets" />}
      <IssueTable issues={data?.issues || []} audience="user" />
    </section>
  );
}

/* ─── My Tasks (developer's assigned tickets) ─────────────────────────────── */

function MyTasksView({ token, session }) {
  const { data, error, loading, reload } = useApi(
    "/api/developer/issues/my-tasks",
    token,
  );
  const [viewing, setViewing] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <section>
      <PageHeader
        title="My Tasks"
        subtitle="Tickets that have been assigned to you."
        action={
          <button className="secondary-button" onClick={reload}>
            Refresh
          </button>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <LoadingPanel label="Loading your tasks" />}
      {!loading && (data?.issues || []).length === 0 && !error && (
        <div className="empty surface">No tasks assigned to you yet</div>
      )}
      <IssueTable
        issues={data?.issues || []}
        onView={setViewing}
        onSelect={setSelected}
      />
      {viewing && (
        <TicketDetailModal issue={viewing} onClose={() => setViewing(null)} />
      )}
      {selected && (
        <StatusModal
          issue={selected}
          token={token}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            reload();
          }}
        />
      )}
    </section>
  );
}

/* ─── Developer Dashboard ─────────────────────────────────────────────────── */

function DeveloperDashboard({ token }) {
  const [filter, setFilter] = useState("all");
  const [product, setProduct] = useState("");
  const [viewing, setViewing] = useState(null);

  const trendRange = filter === "last-week" ? "last-week" : "last-month";
  const reminders = useApi("/api/developer/reminders", token);

  const summaryQuery = new URLSearchParams({
    ...(product ? { product } : {}),
    ...dateFilterParams(filter),
  }).toString();

  const bugIssues = useApi(
    `/api/developer/issues?type=Bug${summaryQuery ? `&${summaryQuery}` : ""}`,
    token,
    [filter, product],
  );
  const requirementIssues = useApi(
    `/api/developer/issues?type=New Requirement${summaryQuery ? `&${summaryQuery}` : ""}`,
    token,
    [filter, product],
  );

  // ── FIX: call the dedicated analytics endpoint instead of building client-side ──
  const trendQuery = new URLSearchParams({
    range: trendRange,
    ...(product ? { product } : {}),
  }).toString();
  const trendApi = useApi(
    `/api/developer/analytics/issue-trend?${trendQuery}`,
    token,
    [trendRange, product],
  );

  const bugSummary = summarizeByStatus(bugIssues.data?.issues || []);
  const requirementSummary = summarizeByStatus(
    requirementIssues.data?.issues || [],
  );
  const remindersByType = splitIssuesByType(
    (reminders.data?.reminders || []).map((item) => ({
      ...item.issue,
      pendingDays: item.pendingDays,
    })),
  );

  return (
    <section>
      <PageHeader
        title="Developer Dashboard"
        subtitle="Bugs and new requirements are tracked separately."
      />
      <div className="filters surface">
        <Select
          label="Period"
          value={filter}
          options={["all", "last-week", "last-month"]}
          onChange={setFilter}
        />
        <Select
          label="Product"
          value={product}
          options={["", ...products]}
          onChange={setProduct}
        />
      </div>
      {bugIssues.error && <Notice tone="error">{bugIssues.error}</Notice>}
      {requirementIssues.error && (
        <Notice tone="error">{requirementIssues.error}</Notice>
      )}
      {(bugIssues.loading || requirementIssues.loading) && (
        <LoadingPanel label="Loading dashboard" />
      )}
      <div className="dashboard-split">
        <section>
          <h2 className="section-title">Bugs</h2>
          <div className="metric-grid">
            <Metric
              icon={AlertCircle}
              label="Open"
              value={bugSummary.open}
              color="teal"
            />
            <Metric
              icon={Clock}
              label="On Hold"
              value={bugSummary.onHold}
              color="amber"
            />
            <Metric
              icon={CheckCircle2}
              label="Resolved"
              value={bugSummary.resolved}
              color="green"
            />
            <Metric
              icon={XCircle}
              label="Rejected"
              value={bugSummary.rejected}
              color="red"
            />
          </div>
        </section>
        <section>
          <h2 className="section-title">New Requirements</h2>
          <div className="metric-grid">
            <Metric
              icon={AlertCircle}
              label="Open"
              value={requirementSummary.open}
              color="teal"
            />
            <Metric
              icon={Clock}
              label="On Hold"
              value={requirementSummary.onHold}
              color="amber"
            />
            <Metric
              icon={CheckCircle2}
              label="Resolved"
              value={requirementSummary.resolved}
              color="green"
            />
            <Metric
              icon={XCircle}
              label="Rejected"
              value={requirementSummary.rejected}
              color="red"
            />
          </div>
        </section>
      </div>

      <IssueTrendChart
        data={trendApi.data}
        loading={trendApi.loading}
        error={trendApi.error}
      />

      <h2 className="section-title">Pending Bug Reminders</h2>
      {reminders.error && <Notice tone="error">{reminders.error}</Notice>}
      <IssueTable
        issues={remindersByType.bugs}
        showPending
        onView={setViewing}
      />
      <h2 className="section-title separate-title">
        Pending Requirement Reminders
      </h2>
      <IssueTable
        issues={remindersByType.requirements}
        showPending
        onView={setViewing}
      />
      {viewing && (
        <TicketDetailModal issue={viewing} onClose={() => setViewing(null)} />
      )}
    </section>
  );
}

/* ─── Bug Management ──────────────────────────────────────────────────────── */

function BugManagement({ token, session }) {
  const [filters, setFilters] = useState({
    product: "",
    status: "",
    priority: "",
    type: "",
    category: "",
  });
  const [issueKind, setIssueKind] = useState("Bug");
  const [selected, setSelected] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [assigning, setAssigning] = useState(null);

  const isAdmin = session?.user?.role === "admin";

  const activeFilters = { ...filters, type: issueKind };
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(activeFilters).filter(([, value]) => value),
    ),
  ).toString();
  const path = `/api/developer/issues${query ? `?${query}` : ""}`;
  const { data, error, loading, reload } = useApi(path, token, [
    query,
    issueKind,
  ]);

  async function handleDelete(issue) {
    if (
      !window.confirm(
        `Delete ticket ${displayTicketId(issue)}? This cannot be undone.`,
      )
    )
      return;
    try {
      await api(`/api/admin/issues/${issue.id}`, { method: "DELETE", token });
      reload();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSelfAssign(issue) {
  try {
    await api(`/api/developer/issues/${issue.id}/assign-self`, {
      method: "PATCH",
      token,
    });

    reload();
  } catch (err) {
    alert(err.message);
  }
}

  return (
    <section>
      <PageHeader
        title={isAdmin ? "All Tasks" : "Ticket Management"}
        subtitle="Bugs and new requirements stay in separate work queues."
        action={
          <button className="secondary-button" onClick={reload}>
            Refresh
          </button>
        }
      />
      <div className="segmented-tabs" role="tablist" aria-label="Ticket type">
        {["Bug", "New Requirement"].map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={issueKind === type}
            className={issueKind === type ? "active" : ""}
            onClick={() => setIssueKind(type)}
            type="button"
          >
            {type === "Bug" ? "Bugs" : "New Requirements"}
          </button>
        ))}
      </div>
      <div className="filters surface">
        <Select
          label="Product"
          value={filters.product}
          options={["", ...products]}
          onChange={(product) => setFilters({ ...filters, product })}
        />
        <Select
          label="Status"
          value={filters.status}
          options={["", ...statuses]}
          onChange={(status) => setFilters({ ...filters, status })}
        />
        <Select
          label="Priority"
          value={filters.priority}
          options={["", ...priorities]}
          onChange={(priority) => setFilters({ ...filters, priority })}
        />
        <Select
          label="Category"
          value={filters.category}
          options={["", ...categories]}
          onChange={(category) => setFilters({ ...filters, category })}
        />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <LoadingPanel label="Loading tasks" />}
      <IssueTable
  issues={data?.issues || []}
  onSelect={isAdmin ? setSelected : undefined}
  onView={setViewing}
  onDelete={isAdmin ? handleDelete : undefined}
  onAssign={isAdmin ? setAssigning : undefined}
  onSelfAssign={!isAdmin ? handleSelfAssign : undefined}
/>
      {viewing && (
        <TicketDetailModal issue={viewing} onClose={() => setViewing(null)} />
      )}
      {selected && (
        <StatusModal
          issue={selected}
          token={token}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            reload();
          }}
        />
      )}
      {assigning && (
        <AssignDeveloperModal
          issue={assigning}
          token={token}
          onClose={() => setAssigning(null)}
          onSaved={() => {
            setAssigning(null);
            reload();
          }}
        />
      )}
    </section>
  );
}

/* ─── Manage Developers (Admin) ───────────────────────────────────────────── */

function ManageDevelopers({ token }) {
  const { data, error, loading, reload } = useApi(
    "/api/admin/developers",
    token,
  );
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formState, setFormState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  async function createDeveloper(event) {
    event.preventDefault();
    setFormState({ loading: true, error: "", success: "" });
    try {
      await api("/api/admin/create-developer", {
        method: "POST",
        token,
        body: form,
      });
      setFormState({
        loading: false,
        error: "",
        success: `Developer "${form.name}" created successfully!`,
      });
      setForm({ name: "", email: "", password: "" });
      reload();
    } catch (err) {
      setFormState({ loading: false, error: err.message, success: "" });
    }
  }

  return (
    <section>
      <PageHeader
        title="Manage Developers"
        subtitle="Create developer accounts and view existing team members."
      />

      <form className="surface form-grid" onSubmit={createDeveloper}>
        <h2 className="section-title form-section-title">
          Create Developer Account
        </h2>
        <Field
          label="Full Name"
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          required
        />
        <Field
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
          required
        />
        <PasswordField
          label="Password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          required
        />
        {formState.error && <Notice tone="error">{formState.error}</Notice>}
        {formState.success && (
          <Notice tone="success">{formState.success}</Notice>
        )}
        <button className="primary-button" disabled={formState.loading}>
          {formState.loading && <LoaderCircle className="spin" size={18} />}
          {formState.loading ? "Creating account" : "Create Developer"}
        </button>
      </form>

      <div className="dev-section-header">
        <h2 className="section-title">Developer Accounts</h2>
        <button className="secondary-button" onClick={reload}>
          Refresh
        </button>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {loading && <LoadingPanel label="Loading developers" />}

      {!loading && (data?.developers || []).length === 0 && !error && (
        <div className="empty surface">No developer accounts yet</div>
      )}

      <div className="dev-list">
        {(data?.developers || []).map((dev) => (
          <div key={dev.id} className="surface dev-card">
            <div className="dev-avatar">
              {dev.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="dev-info">
              <strong>{dev.name}</strong>
              <span>{dev.email}</span>
            </div>
            <small className="dev-joined">
              Joined {formatDate(dev.createdAt)}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Status Modal ────────────────────────────────────────────────────────── */

function StatusModal({ issue, token, onClose, onSaved }) {
  const [status, setStatus] = useState(issue.status);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api(`/api/developer/issues/${issue.id}/status`, {
        method: "PATCH",
        token,
        body: { status, comment },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={save}>
        <h2>Update Status</h2>
        <p>
          {displayTicketId(issue)} · {issue.title}
        </p>
        <Select
          label="Status"
          value={status}
          options={statuses}
          onChange={setStatus}
        />
        <TextArea
          label="Developer Comment"
          value={comment}
          onChange={setComment}
          required
        />
        {error && <Notice tone="error">{error}</Notice>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" disabled={loading}>
            {loading && <LoaderCircle className="spin" size={17} />}
            {loading ? "Saving" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Assign Developer Modal (Admin) ─────────────────────────────────────── */

function AssignDeveloperModal({ issue, token, onClose, onSaved }) {
  const devs = useApi("/api/admin/developers", token);
  const [selectedDevId, setSelectedDevId] = useState(
    issue.assignedTo?.id || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api(`/api/admin/issues/${issue.id}/assign`, {
        method: "PATCH",
        token,
        body: { developerId: selectedDevId },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={save}>
        <h2>Assign Developer</h2>
        <p>
          {displayTicketId(issue)} · {issue.title}
        </p>
        {devs.loading && <LoadingPanel label="Loading developers" />}
        {!devs.loading && (
          <label className="field">
            <span>Developer</span>
            <select
              value={selectedDevId}
              onChange={(e) => setSelectedDevId(e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {(devs.data?.developers || []).map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.name} ({dev.email})
                </option>
              ))}
            </select>
          </label>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" disabled={loading || devs.loading}>
            {loading && <LoaderCircle className="spin" size={17} />}
            {loading ? "Saving" : "Save Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Issue Detail ────────────────────────────────────────────────────────── */

function IssueDetail({ issue, audience }) {
  return (
    <div className="surface detail-grid">
      <Info label="Ticket ID" value={displayTicketId(issue)} />
      <Info label="Product" value={issue.product} />
      <Info label="Type" value={issue.type} />
      <Info label="Title" value={issue.title} />
      <Info label="Created By" value={personLabel(issue.createdBy)} />
      <Info
        label="Status"
        value={<StatusBadge value={displayStatus(issue, audience)} />}
      />
      <Info label="Priority" value={<PriorityBadge value={issue.priority} />} />
      <Info label="Category" value={issue.category} />
      <Info label="Created Date" value={formatDate(issue.createdAt)} />
      {issue.assignedTo && (
        <Info label="Assigned To" value={personLabel(issue.assignedTo)} />
      )}
      <Info
        label="Developer Comment"
        value={<CommentSummary comment={latestComment(issue)} />}
        wide
      />
    </div>
  );
}

/* ─── Ticket Detail Modal ─────────────────────────────────────────────────── */

function TicketDetailModal({ issue, onClose }) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ticket details"
      >
        <div className="detail-modal-header">
          <div>
            <span className="ticket-pill">{displayTicketId(issue)}</span>
            <h2>{issue.title}</h2>
            <div className="issue-meta">
              <span>{issue.product}</span>
              <span>{issue.type}</span>
              <span>{issue.category}</span>
            </div>
          </div>
          <StatusBadge value={issue.status} />
        </div>

        <div className="detail-grid">
          <Info label="Created By" value={personLabel(issue.createdBy)} />
          <Info
            label="Priority"
            value={<PriorityBadge value={issue.priority} />}
          />
          <Info label="Created Date" value={formatDate(issue.createdAt)} />
          {issue.deadline && (
            <Info
              label="Deadline"
              value={<DeadlineBadge value={issue.deadline} />}
            />
          )}
          <Info label="Browser / Device" value={issue.browserDevice || "-"} />
          {issue.assignedTo ? (
            <Info label="Assigned To" value={personLabel(issue.assignedTo)} />
          ) : (
            <Info label="Assigned To" value="Unassigned" />
          )}
          <Info
            label="Attachment"
            value={attachmentValue(issue.attachmentUrl)}
            wide
          />
          <Info label="Description" value={longText(issue.description)} wide />
          <Info
            label="Steps to Reproduce"
            value={longText(issue.stepsToReproduce)}
            wide
          />
          <Info
            label="Expected Result"
            value={longText(issue.expectedResult)}
            wide
          />
          <Info
            label="Actual Result"
            value={longText(issue.actualResult)}
            wide
          />
        </div>

        <div className="comment-history">
          <h3>Developer Comments</h3>
          {issue.developerComments?.length ? (
            issue.developerComments.map((comment, index) => (
              <div
                className="comment-entry"
                key={`${comment.updatedAt}-${index}`}
              >
                <span>
                  {comment.oldStatus} → {comment.newStatus}
                </span>
                <p>{comment.comment}</p>
                <small>
                  By {comment.updatedBy || "Developer"} ·{" "}
                  {formatDate(comment.updatedAt)}
                </small>
              </div>
            ))
          ) : (
            <p>No developer comments yet.</p>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

/* ─── Issue Table ─────────────────────────────────────────────────────────── */

function IssueTable({
  issues,
  onSelect,
  onView,
  showPending = false,
  onDelete,
  onAssign,
  onSelfAssign,
  audience,
}) {
  return (
    <div className="issue-list">
      {issues.length === 0 && (
        <div className="empty surface">No issues found</div>
      )}
      {issues.map((issue) => {
        return (
          <article
            className={`issue-card surface${issue.status === "Rejected" ? " issue-card--rejected" : ""}`}
            key={issue.id}
          >
            <div className="issue-card-top">
              <span className="ticket-pill">{displayTicketId(issue)}</span>
              <StatusBadge value={displayStatus(issue, audience)} />
            </div>
            <h3>{issue.title}</h3>
            <div className="issue-meta">
              <span>{issue.product}</span>
              <span>{issue.type}</span>
              <span>{issue.category}</span>
            </div>
            <div className="issue-card-grid">
              <Info label="Created By" value={personLabel(issue.createdBy)} />
              <Info
                label="Priority"
                value={<PriorityBadge value={issue.priority} />}
              />
              {showPending && (
                <Info label="Pending" value={`${issue.pendingDays} days`} />
              )}
              <Info label="Created" value={formatDate(issue.createdAt)} />
              {audience !== "user" && issue.deadline && (
                <Info
                  label="Deadline"
                  value={<DeadlineBadge value={issue.deadline} />}
                />
              )}
              {(onAssign || onDelete) && (
                <Info
                  label="Assigned To"
                  value={
                    issue.assignedTo ? (
                      <span className="assigned-chip">
                        {issue.assignedTo.name}
                      </span>
                    ) : (
                      <span className="unassigned-chip">Unassigned</span>
                    )
                  }
                />
              )}
            </div>
            {(onView || onSelect || onDelete || onAssign) && (
              <div className="issue-actions">
                {onView && (
                  <button
                    className="small-button"
                    onClick={() => onView(issue)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                )}
                {onSelect && (
                  <button
                    className="small-button"
                    onClick={() => onSelect(issue)}
                  >
                    Update Status
                  </button>
                )}
                {onAssign && (
                  <button
                    className="small-button assign-button"
                    onClick={() => onAssign(issue)}
                  >
                    <UserCog size={16} /> Assign Dev
                  </button>
                )}
                {onSelfAssign && !issue.assignedTo && (
                  <button
                    className="small-button assign-button"
                    onClick={() => onSelfAssign(issue)}
                  >
                    <UserCheck size={16} />
                    Assign to Me
                  </button>
                )}
                {onDelete && (
                  <button
                    className="small-button danger-button"
                    onClick={() => onDelete(issue)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

/* ─── Docs Page ───────────────────────────────────────────────────────────── */

function DocsPage({ onNavigate, inApp = false }) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onNavigate) onNavigate("report");
    else navigate("/login");
  };

  return (
    <section className={inApp ? "" : "docs-page"}>
      <PageHeader
        title={
          <span className="page-title-brand">
            <span>BugYou Portal Guide</span>
            <DevBetaBadge />
          </span>
        }
        subtitle="How users and developers move an issue from report to resolution."
        action={
          !inApp && (
            <button className="secondary-button" onClick={handleBack}>
              <Home size={16} /> Back to login
            </button>
          )
        }
      />
      <div className="docs-grid">
        <article className="surface doc-card">
          <span className="eyebrow">For users</span>
          <h2>Report with clarity</h2>
          <p>
            Choose the product, category, priority, device, and add what
            happened versus what you expected. After submit, copy the generated
            ticket ID.
          </p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">Tracking</span>
          <h2>Follow the feeling of progress</h2>
          <p>
            Use Track Ticket with your ticket ID to see status, priority, and
            the latest developer comment without opening a spreadsheet or asking
            someone manually.
          </p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">For developers</span>
          <h2>Manage as cards</h2>
          <p>
            Use My Tasks to update status for tickets assigned to you. Bug
            Management stays browse-only for developers, with filters by
            product, status, priority, type, or category.
          </p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">For admins</span>
          <h2>Team & assignment control</h2>
          <p>
            Create developer accounts, assign developers to specific tickets,
            update any ticket status, delete invalid or duplicate bugs, and view
            the full dashboard with all task assignments.
          </p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">Routes</span>
          <h2>Portal paths</h2>
          <p>
            Public: /login and /docs. Protected: /my-tickets, /report, /track,
            /dashboard, /manage, /my-tasks, /manage-devs. Unknown routes show a
            404 page.
          </p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">Statuses</span>
          <h2>Ticket lifecycle</h2>
          <p>
            Open → On Hold → Resolved (closed positively), or Rejected
            (invalid/duplicate bug). Each status change requires a mandatory
            developer comment explaining the decision.
          </p>
        </article>
      </div>
      {!inApp && <AppMetaFooter />}
    </section>
  );
}

function NotFoundPage({ session }) {
  const homePath = defaultPath(session);
  return (
    <main className="not-found-page">
      <section className="not-found-panel surface">
        <div className="brand auth-brand">
          <span className="brand-mark">
            <Bug size={22} />
          </span>
          <div>
            <BrandName />
            <small>Issue tracking</small>
          </div>
        </div>
        <div className="form-heading">
          <h1>Page not found</h1>
          <p>The route you opened does not exist in this portal.</p>
        </div>
        <NavLink className="primary-button" to={homePath}>
          <Home size={17} />
          Go to portal
        </NavLink>
      </section>
    </main>
  );
}

/* ─── Shared UI components ────────────────────────────────────────────────── */

function BrandName() {
  return (
    <strong className="brand-name">
      <span>BugYou</span>
      <DevBetaBadge />
    </strong>
  );
}

function DevBetaBadge() {
  return <span className="dev-beta-badge">Dev Beta</span>;
}

function AppMetaFooter() {
  return (
    <footer className="app-meta-footer">
      <span>
        Contact for issues:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </span>
      <span>Beta version {BETA_VERSION}</span>
    </footer>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function PasswordField({ label, value, onChange, required = false }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="password-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={visible ? "off" : "current-password"}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          title={visible ? "Hide password" : "Show password"}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <label className="field span-2">
      <span>{label}</span>
      <textarea
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "All"}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ icon: Icon, label, value, color = "teal" }) {
  return (
    <div className={`metric surface metric--${color}`}>
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IssueTrendChart({ data, loading, error }) {
  const series = data?.series || [];
  const maxCount = Math.max(data?.maxCount || 0, 1);

  return (
    <section className="surface chart-card">
      <div className="chart-header">
        <div>
          <h2>Issue Creation Trend</h2>
          <p>{data?.days || 30} day created count</p>
        </div>
        <strong>{data?.totalCreated || 0} created</strong>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <LoadingPanel label="Loading trend data" />}
      {!loading && !error && series.length === 0 && (
        <div className="chart-empty">No issues in this period</div>
      )}
      {!loading && series.length > 0 && (
        <>
          <div className="chart-bars">
            {series.map((point, index) => (
              <div className="chart-column" key={point.date}>
                <div
                  className="chart-stack"
                  title={`${point.date}: ${point.total} created`}
                >
                  <span
                    className="chart-segment bugs"
                    style={{
                      height: `${((point.bugs || 0) / maxCount) * 100}%`,
                    }}
                  />
                  <span
                    className="chart-segment requirements"
                    style={{
                      height: `${((point.requirements || 0) / maxCount) * 100}%`,
                    }}
                  />
                </div>
                {(index === 0 ||
                  index === series.length - 1 ||
                  index % 7 === 0) && (
                  <small>{formatShortDate(point.date)}</small>
                )}
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot bugs" /> Bugs
            </span>
            <span>
              <i className="legend-dot requirements" /> New requirements
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function DeadlineBadge({ value }) {
  const state = deadlineState(value);
  return (
    <span className={`deadline-badge deadline-${state.tone}`}>
      {state.label}
    </span>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`badge status-${value.toLowerCase().replaceAll(" ", "-")}`}
    >
      {value}
    </span>
  );
}

function PriorityBadge({ value }) {
  return (
    <span className={`badge priority-${value.toLowerCase()}`}>{value}</span>
  );
}

function CommentSummary({ comment }) {
  if (!comment) return "No comment yet";
  return (
    <span className="comment-summary">
      <span>{comment.comment}</span>
      <small>
        By {comment.updatedBy || "Developer"} · {formatDate(comment.updatedAt)}
      </small>
    </span>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? "info wide" : "info"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Notice({ tone, children }) {
  const Icon = tone === "success" ? Smile : Frown;
  return (
    <div className={`notice ${tone}`}>
      <Icon size={18} /> <span>{children}</span>
    </div>
  );
}

function LoadingPanel({ label }) {
  return (
    <div className="loading-panel surface">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function latestComment(issue) {
  return issue.developerComments?.length
    ? issue.developerComments[issue.developerComments.length - 1]
    : null;
}

function longText(value) {
  return value ? <span className="long-text">{value}</span> : "-";
}

function attachmentValue(value) {
  if (!value) return "-";
  if (/^https?:\/\//i.test(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }
  return value;
}

function summarizeByStatus(issues) {
  return issues.reduce(
    (summary, issue) => {
      if (issue.status === "Open") summary.open += 1;
      if (issue.status === "On Hold") summary.onHold += 1;
      if (issue.status === "Resolved") summary.resolved += 1;
      if (issue.status === "Rejected") summary.rejected += 1;
      return summary;
    },
    { open: 0, onHold: 0, resolved: 0, rejected: 0 },
  );
}

function splitIssuesByType(issues) {
  return issues.reduce(
    (groups, issue) => {
      if (issue.type === "New Requirement") groups.requirements.push(issue);
      else groups.bugs.push(issue);
      return groups;
    },
    { bugs: [], requirements: [] },
  );
}

function displayStatus(issue, audience) {
  if (audience === "user" && issue.assignedTo && issue.status === "Open")
    return "Assigned";
  return issue.status;
}

function displayTicketId(issue) {
  const ticketId = issue?.ticketId || "-";
  if (issue?.type === "New Requirement") return ticketId.replace(/^BUG/i, "NR");
  return ticketId.replace(/^NR/i, "BUG");
}

function backendTicketId(ticketId) {
  return ticketId.trim().toUpperCase();
}

function deadlineState(value) {
  if (!value) return { label: "-", tone: "ok" };
  const dateValue = String(value).slice(0, 10);
  const today = startOfDay(new Date());
  const deadline = startOfDay(new Date(`${dateValue}T00:00:00`));
  const daysLeft = Math.ceil((deadline - today) / 86400000);

  if (Number.isNaN(daysLeft)) return { label: value, tone: "ok" };
  if (daysLeft < 0)
    return { label: `Overdue ${Math.abs(daysLeft)}d`, tone: "urgent" };
  if (daysLeft === 0) return { label: "Due today", tone: "urgent" };
  if (daysLeft === 1) return { label: "1 day left", tone: "urgent" };
  return { label: `${daysLeft} days left`, tone: "ok" };
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateFilterParams(filter) {
  if (filter === "all") return {};
  const start = new Date();
  start.setDate(start.getDate() - (filter === "last-week" ? 7 : 30));
  return { startDate: start.toISOString().slice(0, 10) };
}

function personLabel(person) {
  if (!person) return "-";
  if (person.name && person.email) return `${person.name} (${person.email})`;
  return person.name || person.email || "-";
}

/* ─── API hooks ───────────────────────────────────────────────────────────── */

function useApi(path, token, deps = []) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ data: null, error: "", loading: true });
  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, error: "", loading: true }));
    api(path, { token })
      .then((data) => active && setState({ data, error: "", loading: false }))
      .catch(
        (error) =>
          active &&
          setState({ data: null, error: error.message, loading: false }),
      );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, token, tick, ...deps]);
  return { ...state, reload: () => setTick((value) => value + 1) };
}

async function api(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
