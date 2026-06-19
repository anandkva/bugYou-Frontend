import React from "react";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { api, isAuthExpiredError, useApi } from "../api/client";
import { statuses } from "../constants";
import { displayTicketId } from "../utils/issues";
import { LoadingPanel, Notice } from "./feedback";
import { Select, TextArea } from "./forms";

export function StatusModal({ issue, token, onClose, onSaved }) {
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
      if (isAuthExpiredError(err)) return;
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

export function AssignDeveloperModal({ issue, token, onClose, onSaved }) {
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
      if (isAuthExpiredError(err)) return;
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
