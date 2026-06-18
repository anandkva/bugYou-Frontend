import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Bug,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Frown,
  HeartHandshake,
  Home,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  Smile,
  UserPlus,
} from 'lucide-react';
import './styles.css';

const API_URL = 'https://bug-you-backend.vercel.app';

const products = ['ZenClass', 'Classify', 'Hyernet', 'PlacementInfo', 'GuviPortal', 'Other'];
const categories = ['UI', 'Backend/API', 'Login/Auth', 'Payment', 'Performance', 'Data Issue', 'New Requirement', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Open', 'On Hold', 'Resolved'];
const devices = ['Chrome on Mac', 'Chrome on Windows', 'Chrome on Android', 'Safari on iPhone', 'Safari on Mac', 'Firefox', 'Edge', 'Mobile App', 'Other'];
const routes = {
  '/': 'report',
  '/my-tickets': 'my',
  '/my-issues': 'my',
  '/report': 'report',
  '/track': 'track',
  '/dashboard': 'dashboard',
  '/manage': 'manage',
  '/docs': 'docs',
};

function viewFromPath() {
  return routes[window.location.pathname] || 'report';
}

function pathFromView(view) {
  return Object.entries(routes).find(([, routeView]) => routeView === view)?.[0] || '/report';
}

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('bugyou-session');
    return raw ? JSON.parse(raw) : null;
  });
  const [view, setView] = useState(viewFromPath);

  useEffect(() => {
    if (session) localStorage.setItem('bugyou-session', JSON.stringify(session));
    else localStorage.removeItem('bugyou-session');
  }, [session]);

  useEffect(() => {
    const syncRoute = () => setView(viewFromPath());
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  function navigate(nextView) {
    const path = pathFromView(nextView);
    setView(nextView);
    window.history.pushState({}, '', path);
  }

  if (!session && view !== 'docs') return <AuthScreen onSession={setSession} onDocs={() => navigate('docs')} />;
  if (!session && view === 'docs') return <DocsPage onNavigate={navigate} />;

  const isDeveloper = session.user.role === 'developer';
  const navItems = isDeveloper
    ? [
        ['dashboard', 'Dashboard', BarChart3],
        ['manage', 'Bug Management', ClipboardList],
        ['track', 'Track Ticket', Search],
        ['docs', 'Portal Guide', BookOpen],
      ]
    : [
        ['my', 'My Tickets', ClipboardList],
        ['report', 'Report Issue', Plus],
        ['track', 'Track Ticket', Search],
        ['docs', 'Portal Guide', BookOpen],
      ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Bug size={20} /></span>
          <div>
            <strong>BugYou</strong>
            <small>Issue tracking</small>
          </div>
        </div>
        <nav>
          {navItems.map(([id, label, Icon]) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => navigate(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="profile">
          <span>{session.user.name}</span>
          <small>{session.user.role}</small>
          <button className="icon-button" onClick={() => setSession(null)} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="content">
        {view === 'docs' && <DocsPage onNavigate={navigate} inApp />}
        {view === 'report' && <ReportIssue token={session.token} />}
        {view === 'track' && <TrackTicket token={session.token} />}
        {view === 'my' && <MyIssues token={session.token} />}
        {view === 'dashboard' && <DeveloperDashboard token={session.token} />}
        {view === 'manage' && <BugManagement token={session.token} />}
      </main>
    </div>
  );
}

function AuthScreen({ onSession, onDocs }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [state, setState] = useState({ loading: false, error: '', success: false });

  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, error: '', success: false });
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password, role: 'user' };

    try {
      const data = await api(endpoint, { method: 'POST', body: payload });
      setState({ loading: false, error: '', success: true });
      onSession(data);
    } catch (error) {
      setState({ loading: false, error: error.message, success: false });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <span className="brand-mark"><Bug size={22} /></span>
          <div>
            <strong>BugYou</strong>
            <small>Calm issue care portal</small>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="form-heading">
            <span className="eyebrow"><HeartHandshake size={15} /> Mobile first support desk</span>
            <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
            <p>{mode === 'login' ? 'Bring every product issue into one gentle, accountable place.' : 'Start reporting issues with clear ticket tracking.'}</p>
          </div>
          {mode === 'register' && (
            <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          )}
          <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
          <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required />
          {state.error && <Notice tone="error">{state.error}</Notice>}
          {state.success && <Notice tone="success">Login complete. Opening your workspace.</Notice>}
          <button className="primary-button" disabled={state.loading}>
            {state.loading && <LoaderCircle className="spin" size={18} />}
            {!state.loading && (mode === 'login' ? 'Sign in' : 'Create user')}
            {state.loading && (mode === 'login' ? 'Checking account' : 'Creating user')}
          </button>
        </form>
        <button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <UserPlus size={16} />
          {mode === 'login' ? 'Create a user account' : 'Already have an account'}
        </button>
        <button className="text-button muted" onClick={onDocs}>
          <BookOpen size={16} />
          Read portal guide
        </button>
      </section>
    </main>
  );
}

function ReportIssue({ token }) {
  const [form, setForm] = useState({
    type: 'Bug',
    product: 'ZenClass',
    title: '',
    description: '',
    category: 'UI',
    priority: 'Medium',
    attachmentUrl: '',
    browserDevice: 'Chrome on Mac',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api('/api/issues', { method: 'POST', token, body: form });
      setResult(data);
      setForm({ ...form, title: '', description: '', attachmentUrl: '', stepsToReproduce: '', expectedResult: '', actualResult: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PageHeader title="Report an Issue" subtitle="Create a bug or requirement with a generated ticket ID." />
      <form className="surface form-grid" onSubmit={submit}>
        <Select label="Issue Type" value={form.type} options={['Bug', 'New Requirement']} onChange={(type) => setForm({ ...form, type })} />
        <Select label="Product" value={form.product} options={products} onChange={(product) => setForm({ ...form, product })} />
        <Select label="Category" value={form.category} options={categories} onChange={(category) => setForm({ ...form, category })} />
        <Select label="Priority" value={form.priority} options={priorities} onChange={(priority) => setForm({ ...form, priority })} />
        <Select label="Browser / Device" value={form.browserDevice} options={devices} onChange={(browserDevice) => setForm({ ...form, browserDevice })} />
        <Field label="Attachment URL" value={form.attachmentUrl} onChange={(attachmentUrl) => setForm({ ...form, attachmentUrl })} placeholder="Optional screenshot link or filename" />
        <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} placeholder="Short issue summary" required />
        <TextArea label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} required />
        <TextArea label="Steps to Reproduce" value={form.stepsToReproduce} onChange={(stepsToReproduce) => setForm({ ...form, stepsToReproduce })} />
        <TextArea label="Expected Result" value={form.expectedResult} onChange={(expectedResult) => setForm({ ...form, expectedResult })} />
        <TextArea label="Actual Result" value={form.actualResult} onChange={(actualResult) => setForm({ ...form, actualResult })} />
        {error && <Notice tone="error">{error}</Notice>}
        {result && <Notice tone="success">Created successfully. Ticket ID: {result.ticketId}</Notice>}
        <button className="primary-button" disabled={loading}>
          {loading && <LoaderCircle className="spin" size={18} />}
          {loading ? 'Creating ticket' : 'Submit Issue'}
        </button>
      </form>
    </section>
  );
}

function TrackTicket({ token }) {
  const [ticketId, setTicketId] = useState('');
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function track(event) {
    event.preventDefault();
    setError('');
    setIssue(null);
    setLoading(true);
    try {
      const data = await api(`/api/issues/track/${ticketId}`, { token });
      setIssue(data.issue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PageHeader title="Track Ticket" subtitle="Look up status and latest developer comments." />
      <form className="surface search-row" onSubmit={track}>
        <Field label="Ticket ID" value={ticketId} onChange={setTicketId} placeholder="BUG-2026-001" required />
        <button className="primary-button" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={17} /> : <Search size={17} />}
          {loading ? 'Tracking' : 'Track'}
        </button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      {issue && <IssueDetail issue={issue} />}
    </section>
  );
}

function MyIssues({ token }) {
  const { data, error, reload } = useApi('/api/issues/my', token);
  return (
    <section>
      <PageHeader title="My Tickets" subtitle="Issues and requirements reported from your account." action={<button className="secondary-button" onClick={reload}>Refresh</button>} />
      {error && <Notice tone="error">{error}</Notice>}
      <IssueTable issues={data?.issues || []} />
    </section>
  );
}

function DeveloperDashboard({ token }) {
  const [filter, setFilter] = useState('all');
  const [product, setProduct] = useState('');
  const [viewing, setViewing] = useState(null);
  const trendRange = filter === 'last-week' ? 'last-week' : 'last-month';
  const trendPath = `/api/developer/analytics/issue-trend?range=${trendRange}${product ? `&product=${product}` : ''}`;
  const trend = useApi(trendPath, token, [trendRange, product]);
  const reminders = useApi('/api/developer/reminders', token);
  const summaryQuery = new URLSearchParams({
    ...(product ? { product } : {}),
    ...dateFilterParams(filter),
  }).toString();
  const bugIssues = useApi(`/api/developer/issues?type=Bug${summaryQuery ? `&${summaryQuery}` : ''}`, token, [filter, product]);
  const requirementIssues = useApi(`/api/developer/issues?type=New Requirement${summaryQuery ? `&${summaryQuery}` : ''}`, token, [filter, product]);
  const bugSummary = summarizeByStatus(bugIssues.data?.issues || []);
  const requirementSummary = summarizeByStatus(requirementIssues.data?.issues || []);
  const remindersByType = splitIssuesByType((reminders.data?.reminders || []).map((item) => ({ ...item.issue, pendingDays: item.pendingDays })));

  return (
    <section>
      <PageHeader title="Developer Dashboard" subtitle="Bugs and new requirements are tracked separately." />
      <div className="filters surface">
        <Select label="Period" value={filter} options={['all', 'last-week', 'last-month']} onChange={setFilter} />
        <Select label="Product" value={product} options={['', ...products]} onChange={setProduct} />
      </div>
      {bugIssues.error && <Notice tone="error">{bugIssues.error}</Notice>}
      {requirementIssues.error && <Notice tone="error">{requirementIssues.error}</Notice>}
      <div className="dashboard-split">
        <section>
          <h2 className="section-title">Bugs</h2>
          <div className="metric-grid">
            <Metric icon={AlertCircle} label="Open Bugs" value={bugSummary.open} />
            <Metric icon={Clock} label="On Hold Bugs" value={bugSummary.onHold} />
            <Metric icon={CheckCircle2} label="Resolved Bugs" value={bugSummary.resolved} />
          </div>
        </section>
        <section>
          <h2 className="section-title">New Requirements</h2>
          <div className="metric-grid">
            <Metric icon={AlertCircle} label="Open Requirements" value={requirementSummary.open} />
            <Metric icon={Clock} label="On Hold Requirements" value={requirementSummary.onHold} />
            <Metric icon={CheckCircle2} label="Resolved Requirements" value={requirementSummary.resolved} />
          </div>
        </section>
      </div>
      <IssueTrendChart data={trend.data} error={trend.error} />
      <h2 className="section-title">Pending Bug Reminders</h2>
      {reminders.error && <Notice tone="error">{reminders.error}</Notice>}
      <IssueTable issues={remindersByType.bugs} showPending onView={setViewing} />
      <h2 className="section-title separate-title">Pending Requirement Reminders</h2>
      <IssueTable issues={remindersByType.requirements} showPending onView={setViewing} />
      {viewing && <TicketDetailModal issue={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}

function BugManagement({ token }) {
  const [filters, setFilters] = useState({ product: '', status: '', priority: '', type: '', category: '' });
  const [issueKind, setIssueKind] = useState('Bug');
  const [selected, setSelected] = useState(null);
  const [viewing, setViewing] = useState(null);
  const activeFilters = { ...filters, type: issueKind };
  const query = new URLSearchParams(Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value))).toString();
  const path = `/api/developer/issues${query ? `?${query}` : ''}`;
  const { data, error, reload } = useApi(path, token, [query, issueKind]);

  return (
    <section>
      <PageHeader title="Ticket Management" subtitle="Bugs and new requirements stay in separate work queues." action={<button className="secondary-button" onClick={reload}>Refresh</button>} />
      <div className="segmented-tabs" role="tablist" aria-label="Ticket type">
        {['Bug', 'New Requirement'].map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={issueKind === type}
            className={issueKind === type ? 'active' : ''}
            onClick={() => setIssueKind(type)}
            type="button"
          >
            {type === 'Bug' ? 'Bugs' : 'New Requirements'}
          </button>
        ))}
      </div>
      <div className="filters surface">
        <Select label="Product" value={filters.product} options={['', ...products]} onChange={(product) => setFilters({ ...filters, product })} />
        <Select label="Status" value={filters.status} options={['', ...statuses]} onChange={(status) => setFilters({ ...filters, status })} />
        <Select label="Priority" value={filters.priority} options={['', ...priorities]} onChange={(priority) => setFilters({ ...filters, priority })} />
        <Select label="Category" value={filters.category} options={['', ...categories]} onChange={(category) => setFilters({ ...filters, category })} />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <IssueTable issues={data?.issues || []} onSelect={setSelected} onView={setViewing} />
      {viewing && <TicketDetailModal issue={viewing} onClose={() => setViewing(null)} />}
      {selected && <StatusModal issue={selected} token={token} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); reload(); }} />}
    </section>
  );
}

function StatusModal({ issue, token, onClose, onSaved }) {
  const [status, setStatus] = useState(issue.status);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function save(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api(`/api/developer/issues/${issue.id}/status`, { method: 'PATCH', token, body: { status, comment } });
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
        <p>{issue.ticketId} · {issue.title}</p>
        <Select label="Status" value={status} options={statuses} onChange={setStatus} />
        <TextArea label="Developer Comment" value={comment} onChange={setComment} required />
        {error && <Notice tone="error">{error}</Notice>}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={loading}>
            {loading && <LoaderCircle className="spin" size={17} />}
            {loading ? 'Saving' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

function IssueDetail({ issue }) {
  return (
    <div className="surface detail-grid">
      <Info label="Ticket ID" value={issue.ticketId} />
      <Info label="Product" value={issue.product} />
      <Info label="Type" value={issue.type} />
      <Info label="Title" value={issue.title} />
      <Info label="Created By" value={personLabel(issue.createdBy)} />
      <Info label="Status" value={<StatusBadge value={issue.status} />} />
      <Info label="Priority" value={<PriorityBadge value={issue.priority} />} />
      <Info label="Category" value={issue.category} />
      <Info label="Created Date" value={formatDate(issue.createdAt)} />
      <Info label="Developer Comment" value={<CommentSummary comment={latestComment(issue)} />} wide />
    </div>
  );
}

function TicketDetailModal({ issue, onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal detail-modal" role="dialog" aria-modal="true" aria-label="Ticket details">
        <div className="detail-modal-header">
          <div>
            <span className="ticket-pill">{issue.ticketId}</span>
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
          <Info label="Priority" value={<PriorityBadge value={issue.priority} />} />
          <Info label="Created Date" value={formatDate(issue.createdAt)} />
          <Info label="Browser / Device" value={issue.browserDevice || '-'} />
          <Info label="Attachment" value={attachmentValue(issue.attachmentUrl)} wide />
          <Info label="Description" value={longText(issue.description)} wide />
          <Info label="Steps to Reproduce" value={longText(issue.stepsToReproduce)} wide />
          <Info label="Expected Result" value={longText(issue.expectedResult)} wide />
          <Info label="Actual Result" value={longText(issue.actualResult)} wide />
        </div>

        <div className="comment-history">
          <h3>Developer Comments</h3>
          {issue.developerComments?.length ? (
            issue.developerComments.map((comment, index) => (
              <div className="comment-entry" key={`${comment.updatedAt}-${index}`}>
                <span>{comment.oldStatus} to {comment.newStatus}</span>
                <p>{comment.comment}</p>
                <small>By {comment.updatedBy || 'Developer'} · {formatDate(comment.updatedAt)}</small>
              </div>
            ))
          ) : (
            <p>No developer comments yet.</p>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onClose}>Close</button>
        </div>
      </section>
    </div>
  );
}

function IssueTable({ issues, onSelect, onView, showPending = false }) {
  return (
    <div className="issue-list">
      {issues.length === 0 && <div className="empty surface">No issues found</div>}
      {issues.map((issue) => (
        <article className="issue-card surface" key={issue.id}>
          <div className="issue-card-top">
            <span className="ticket-pill">{issue.ticketId}</span>
            <StatusBadge value={issue.status} />
          </div>
          <h3>{issue.title}</h3>
          <div className="issue-meta">
            <span>{issue.product}</span>
            <span>{issue.type}</span>
            <span>{issue.category}</span>
          </div>
          <div className="issue-card-grid">
            <Info label="Created By" value={personLabel(issue.createdBy)} />
            <Info label="Priority" value={<PriorityBadge value={issue.priority} />} />
            {showPending && <Info label="Pending" value={`${issue.pendingDays} days`} />}
            <Info label="Created" value={formatDate(issue.createdAt)} />
          </div>
          {(onView || onSelect) && (
            <div className="issue-actions">
              {onView && (
                <button className="small-button" onClick={() => onView(issue)}>
                  <Eye size={16} /> View Details
                </button>
              )}
              {onSelect && (
                <button className="small-button" onClick={() => onSelect(issue)}>
                  Update Status
                </button>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function DocsPage({ onNavigate, inApp = false }) {
  return (
    <section className={inApp ? '' : 'docs-page'}>
      <PageHeader
        title="BugYou Portal Guide"
        subtitle="How users and developers move an issue from report to resolution."
        action={!inApp && <button className="secondary-button" onClick={() => onNavigate('report')}><Home size={16} /> Back to login</button>}
      />
      <div className="docs-grid">
        <article className="surface doc-card">
          <span className="eyebrow">For users</span>
          <h2>Report with clarity</h2>
          <p>Choose the product, category, priority, device, and add what happened versus what you expected. After submit, copy the generated ticket ID.</p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">Tracking</span>
          <h2>Follow the feeling of progress</h2>
          <p>Use Track Ticket with your ticket ID to see status, priority, and the latest developer comment without opening a spreadsheet or asking someone manually.</p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">For developers</span>
          <h2>Manage as cards</h2>
          <p>Filter by product, status, priority, type, or category. Open an issue card, change status, and add a mandatory comment so the user understands what changed.</p>
        </article>
        <article className="surface doc-card">
          <span className="eyebrow">Routes</span>
          <h2>Portal paths</h2>
          <p>Use /my-tickets, /report, /track, /dashboard, /manage, and /docs. Developer-only routes depend on the logged-in role.</p>
        </article>
      </div>
    </section>
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

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <label className="field span-2">
      <span>{label}</span>
      <textarea value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option || 'All'}</option>
        ))}
      </select>
    </label>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric surface">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IssueTrendChart({ data, error }) {
  const series = data?.series || [];
  const maxCount = Math.max(data?.maxCount || 0, 1);

  return (
    <section className="surface chart-card">
      <div className="chart-header">
        <div>
          <h2>Issue Creation Trend</h2>
          <p>{data?.days || 30} day created count ratio</p>
        </div>
        <strong>{data?.totalCreated || 0} created</strong>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="chart-bars">
        {series.map((point, index) => (
          <div className="chart-column" key={point.date}>
            <div className="chart-stack" title={`${point.date}: ${point.total} created`}>
              <span
                className="chart-segment bugs"
                style={{ height: `${(point.bugs / maxCount) * 100}%` }}
              />
              <span
                className="chart-segment requirements"
                style={{ height: `${(point.requirements / maxCount) * 100}%` }}
              />
            </div>
            {(index === 0 || index === series.length - 1 || index % 7 === 0) && (
              <small>{formatShortDate(point.date)}</small>
            )}
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span><i className="legend-dot bugs" /> Bugs</span>
        <span><i className="legend-dot requirements" /> New requirements</span>
      </div>
    </section>
  );
}

function StatusBadge({ value }) {
  return <span className={`badge status-${value.toLowerCase().replaceAll(' ', '-')}`}>{value}</span>;
}

function PriorityBadge({ value }) {
  return <span className={`badge priority-${value.toLowerCase()}`}>{value}</span>;
}

function CommentSummary({ comment }) {
  if (!comment) return 'No comment yet';

  return (
    <span className="comment-summary">
      <span>{comment.comment}</span>
      <small>By {comment.updatedBy || 'Developer'} · {formatDate(comment.updatedAt)}</small>
    </span>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? 'info wide' : 'info'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Notice({ tone, children }) {
  const Icon = tone === 'success' ? Smile : Frown;
  return <div className={`notice ${tone}`}><Icon size={18} /> <span>{children}</span></div>;
}

function latestComment(issue) {
  return issue.developerComments?.length ? issue.developerComments[issue.developerComments.length - 1] : null;
}

function longText(value) {
  return value ? <span className="long-text">{value}</span> : '-';
}

function attachmentValue(value) {
  if (!value) return '-';
  if (/^https?:\/\//i.test(value)) {
    return <a href={value} target="_blank" rel="noreferrer">{value}</a>;
  }
  return value;
}

function summarizeByStatus(issues) {
  return issues.reduce((summary, issue) => {
    if (issue.status === 'Open') summary.open += 1;
    if (issue.status === 'On Hold') summary.onHold += 1;
    if (issue.status === 'Resolved') summary.resolved += 1;
    return summary;
  }, { open: 0, onHold: 0, resolved: 0 });
}

function splitIssuesByType(issues) {
  return issues.reduce((groups, issue) => {
    if (issue.type === 'New Requirement') groups.requirements.push(issue);
    else groups.bugs.push(issue);
    return groups;
  }, { bugs: [], requirements: [] });
}

function dateFilterParams(filter) {
  if (filter === 'all') return {};

  const start = new Date();
  start.setDate(start.getDate() - (filter === 'last-week' ? 7 : 30));
  return { startDate: start.toISOString().slice(0, 10) };
}

function personLabel(person) {
  if (!person) return '-';
  if (person.name && person.email) return `${person.name} (${person.email})`;
  return person.name || person.email || '-';
}

function useApi(path, token, deps = []) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ data: null, error: '' });
  useEffect(() => {
    let active = true;
    api(path, { token })
      .then((data) => active && setState({ data, error: '' }))
      .catch((error) => active && setState({ data: null, error: error.message }));
    return () => { active = false; };
  }, [path, token, tick, ...deps]);
  return { ...state, reload: () => setTick((value) => value + 1) };
}

async function api(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(`${value}T00:00:00`));
}

createRoot(document.getElementById('root')).render(<App />);
