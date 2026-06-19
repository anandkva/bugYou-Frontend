import React, { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { api, isAuthExpiredError } from "../api/client";
import { Field, IssueDetail, Notice, PageHeader } from "../components";
import { backendTicketId } from "../utils/issues";

export function TrackTicket({ token }) {
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
      if (isAuthExpiredError(err)) return;
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
