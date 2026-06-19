import React from "react";
import { formatDate } from "../utils/date";
import { deadlineState } from "../utils/issues";

export function DeadlineBadge({ value }) {
  const state = deadlineState(value);
  return (
    <span className={`deadline-badge deadline-${state.tone}`}>
      {state.label}
    </span>
  );
}

export function StatusBadge({ value }) {
  return (
    <span
      className={`badge status-${value.toLowerCase().replaceAll(" ", "-")}`}
    >
      {value}
    </span>
  );
}

export function PriorityBadge({ value }) {
  return (
    <span className={`badge priority-${value.toLowerCase()}`}>{value}</span>
  );
}

export function CommentSummary({ comment }) {
  if (!comment) return "No comment yet";
  return (
    <span className="comment-summary">
      <span>{comment.comment}</span>
      <small>
        By {comment.updatedBy || "Developer"} · {formatDate(comment.updatedAt)}
      </small>
    </span>
  );
}
