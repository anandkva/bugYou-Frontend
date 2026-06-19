import React, { useState } from "react";
import { useApi } from "../api/client";
import {
  IssueTable,
  LoadingPanel,
  Notice,
  PageHeader,
  StatusModal,
  TicketDetailModal,
} from "../components";

export function MyTasksView({ token, session }) {
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
