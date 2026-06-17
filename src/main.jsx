import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertCircle,
  BarChart3,
  Bug,
  CheckCircle2,
  ClipboardList,
  Clock,
  LogOut,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react';
import './styles.css';

const API_URL = 'https://bug-you-backend.vercel.app';

const products = ['ZenClass', 'Classify', 'Hyernet', 'PlacementInfo', 'GuviPortal', 'Other'];
const categories = ['UI', 'Backend/API', 'Login/Auth', 'Payment', 'Performance', 'Data Issue', 'New Requirement', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Open', 'On Hold', 'Resolved'];
const devices = ['Chrome on Mac', 'Chrome on Windows', 'Chrome on Android', 'Safari on iPhone', 'Safari on Mac', 'Firefox', 'Edge', 'Mobile App', 'Other'];

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('bugyou-session');
    return raw ? JSON.parse(raw) : null;
  });
  const [view, setView] = useState('report');

  useEffect(() => {
    if (session) localStorage.setItem('bugyou-session', JSON.stringify(session));
    else localStorage.removeItem('bugyou-session');
  }, [session]);

  if (!session) return <AuthScreen onSession={setSession} />;

  const isDeveloper = session.user.role === 'developer';
  const navItems = isDeveloper
    ? [
        ['dashboard', 'Dashboard', BarChart3],
        ['manage', 'Bug Management', ClipboardList],
        ['track', 'Track Ticket', Search],
      ]
    : [
        ['report', 'Report Issue', Plus],
        ['track', 'Track Ticket', Search],
        ['my', 'My Issues', ClipboardList],
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
            <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
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
        {view === 'report' && <ReportIssue token={session.token} />}
        {view === 'track' && <TrackTicket token={session.token} />}
        {view === 'my' && <MyIssues token={session.token} />}
        {view === 'dashboard' && <DeveloperDashboard token={session.token} />}
        {view === 'manage' && <BugManagement token={session.token} />}
      </main>
    </div>
  );
}

function AuthScreen({ onSession }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [state, setState] = useState({ loading: false, error: '' });

  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, error: '' });
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password, role: 'user' };

    try {
      const data = await api(endpoint, { method: 'POST', body: payload });
      onSession(data);
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <span className="brand-mark"><Bug size={22} /></span>
          <div>
            <strong>BugYou</strong>
            <small>Minimal bug reporting</small>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="form-heading">
            <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
            <p>{mode === 'login' ? 'Access your issue workspace.' : 'User accounts are created here.'}</p>
          </div>
          {mode === 'register' && (
            <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
          )}
          <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
          <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required />
          {state.error && <Notice tone="error">{state.error}</Notice>}
          <button className="primary-button" disabled={state.loading}>
            {mode === 'login' ? 'Sign in' : 'Create user'}
          </button>
        </form>
        <button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <UserPlus size={16} />
          {mode === 'login' ? 'Create a user account' : 'Already have an account'}
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

  async function submit(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    try {
      const data = await api('/api/issues', { method: 'POST', token, body: form });
      setResult(data);
      setForm({ ...form, title: '', description: '', attachmentUrl: '', stepsToReproduce: '', expectedResult: '', actualResult: '' });
    } catch (err) {
      setError(err.message);
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
        <button className="primary-button">Submit Issue</button>
      </form>
    </section>
  );
}

function TrackTicket({ token }) {
  const [ticketId, setTicketId] = useState('');
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState('');

  async function track(event) {
    event.preventDefault();
    setError('');
    setIssue(null);
    try {
      const data = await api(`/api/issues/track/${ticketId}`, { token });
      setIssue(data.issue);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader title="Track Ticket" subtitle="Look up status and latest developer comments." />
      <form className="surface search-row" onSubmit={track}>
        <Field label="Ticket ID" value={ticketId} onChange={setTicketId} placeholder="BUG-2026-001" required />
        <button className="primary-button"><Search size={17} /> Track</button>
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
      <PageHeader title="My Issues" subtitle="Issues reported from your account." action={<button className="secondary-button" onClick={reload}>Refresh</button>} />
      {error && <Notice tone="error">{error}</Notice>}
      <IssueTable issues={data?.issues || []} />
    </section>
  );
}

function DeveloperDashboard({ token }) {
  const [filter, setFilter] = useState('all');
  const [product, setProduct] = useState('');
  const dashboardPath = `/api/developer/dashboard?filter=${filter}${product ? `&product=${product}` : ''}`;
  const trendRange = filter === 'last-week' ? 'last-week' : 'last-month';
  const trendPath = `/api/developer/analytics/issue-trend?range=${trendRange}${product ? `&product=${product}` : ''}`;
  const { data, error } = useApi(dashboardPath, token, [filter, product]);
  const trend = useApi(trendPath, token, [trendRange, product]);
  const reminders = useApi('/api/developer/reminders', token);
  const summary = data?.summary || {};

  return (
    <section>
      <PageHeader title="Developer Dashboard" subtitle="Status summary and old pending reminders." />
      <div className="filters surface">
        <Select label="Period" value={filter} options={['all', 'last-week', 'last-month']} onChange={setFilter} />
        <Select label="Product" value={product} options={['', ...products]} onChange={setProduct} />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="metric-grid">
        <Metric icon={AlertCircle} label="Total Open Bugs" value={summary.totalOpenBugs || 0} />
        <Metric icon={Clock} label="Total On Hold Bugs" value={summary.totalOnHoldBugs || 0} />
        <Metric icon={CheckCircle2} label="Total Resolved Bugs" value={summary.totalResolvedBugs || 0} />
      </div>
      <IssueTrendChart data={trend.data} error={trend.error} />
      <h2 className="section-title">Pending Reminders</h2>
      {reminders.error && <Notice tone="error">{reminders.error}</Notice>}
      <IssueTable issues={(reminders.data?.reminders || []).map((item) => ({ ...item.issue, pendingDays: item.pendingDays }))} showPending />
    </section>
  );
}

function BugManagement({ token }) {
  const [filters, setFilters] = useState({ product: '', status: '', priority: '', type: '', category: '' });
  const [selected, setSelected] = useState(null);
  const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))).toString();
  const path = `/api/developer/issues${query ? `?${query}` : ''}`;
  const { data, error, reload } = useApi(path, token, [query]);

  return (
    <section>
      <PageHeader title="Bug Management" subtitle="Filter issues and update status with a mandatory comment." action={<button className="secondary-button" onClick={reload}>Refresh</button>} />
      <div className="filters surface">
        <Select label="Product" value={filters.product} options={['', ...products]} onChange={(product) => setFilters({ ...filters, product })} />
        <Select label="Status" value={filters.status} options={['', ...statuses]} onChange={(status) => setFilters({ ...filters, status })} />
        <Select label="Priority" value={filters.priority} options={['', ...priorities]} onChange={(priority) => setFilters({ ...filters, priority })} />
        <Select label="Type" value={filters.type} options={['', 'Bug', 'New Requirement']} onChange={(type) => setFilters({ ...filters, type })} />
        <Select label="Category" value={filters.category} options={['', ...categories]} onChange={(category) => setFilters({ ...filters, category })} />
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <IssueTable issues={data?.issues || []} onSelect={setSelected} />
      {selected && <StatusModal issue={selected} token={token} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); reload(); }} />}
    </section>
  );
}

function StatusModal({ issue, token, onClose, onSaved }) {
  const [status, setStatus] = useState(issue.status);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      await api(`/api/developer/issues/${issue.id}/status`, { method: 'PATCH', token, body: { status, comment } });
      onSaved();
    } catch (err) {
      setError(err.message);
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
          <button className="primary-button">Save</button>
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

function IssueTable({ issues, onSelect, showPending = false }) {
  return (
    <div className="table-wrap surface">
      <table>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Product</th>
            <th>Title</th>
            <th>Type</th>
            <th>Created By</th>
            <th>Priority</th>
            <th>Status</th>
            {showPending && <th>Pending</th>}
            <th>Created</th>
            {onSelect && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {issues.length === 0 && (
            <tr><td colSpan={8 + (showPending ? 1 : 0) + (onSelect ? 1 : 0)} className="empty">No issues found</td></tr>
          )}
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.ticketId}</td>
              <td>{issue.product}</td>
              <td>{issue.title}</td>
              <td>{issue.type}</td>
              <td>{personLabel(issue.createdBy)}</td>
              <td><PriorityBadge value={issue.priority} /></td>
              <td><StatusBadge value={issue.status} /></td>
              {showPending && <td>{issue.pendingDays} days</td>}
              <td>{formatDate(issue.createdAt)}</td>
              {onSelect && <td><button className="small-button" onClick={() => onSelect(issue)}>Update</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  return <div className={`notice ${tone}`}>{children}</div>;
}

function latestComment(issue) {
  return issue.developerComments?.length ? issue.developerComments[issue.developerComments.length - 1] : null;
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
