import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { api, isAuthExpiredError } from "../api/client";
import { Field, Notice, PageHeader, Select, TextArea } from "../components";
import { categories, devices, priorities, products } from "../constants";
import { displayTicketId } from "../utils/issues";

export function ReportIssue({ token }) {
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
      if (isAuthExpiredError(err)) return;
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
