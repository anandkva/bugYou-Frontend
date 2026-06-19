import React, { useState } from "react";
import { api, isAuthExpiredError, useApi } from "../api/client";
import {
  AssignDeveloperModal,
  IssueTable,
  LoadingPanel,
  Notice,
  PageHeader,
  Select,
  StatusModal,
  TicketDetailModal,
} from "../components";
import { categories, priorities, products, statuses } from "../constants";
import { displayTicketId } from "../utils/issues";

export function BugManagement({ token, session }) {
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
      if (isAuthExpiredError(err)) return;
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
      if (isAuthExpiredError(err)) return;
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
        currentUser={session?.user}
        onSelect={isAdmin ? setSelected : undefined}
        onView={setViewing}
        onDelete={isAdmin ? handleDelete : undefined}
        onAssign={isAdmin ? setAssigning : undefined}
        onSelfAssign={handleSelfAssign}
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
