import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useApi } from "../api/client";
import {
  IssueTable,
  IssueTrendChart,
  LoadingPanel,
  Metric,
  Notice,
  PageHeader,
  Select,
  TicketDetailModal,
} from "../components";
import { products } from "../constants";
import {
  dateFilterParams,
  splitIssuesByType,
  summarizeByStatus,
} from "../utils/issues";

export function DeveloperDashboard({ token }) {
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
