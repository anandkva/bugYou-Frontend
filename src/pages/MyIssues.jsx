import React from "react";
import { useApi } from "../api/client";
import { IssueTable, LoadingPanel, Notice, PageHeader } from "../components";

export function MyIssues({ token }) {
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
