import React, { useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { api, isAuthExpiredError, useApi } from "../api/client";
import {
  Field,
  LoadingPanel,
  Notice,
  PageHeader,
  PasswordField,
} from "../components";
import { formatDate } from "../utils/date";

export function ManageDevelopers({ token }) {
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
      if (isAuthExpiredError(err)) return;
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
