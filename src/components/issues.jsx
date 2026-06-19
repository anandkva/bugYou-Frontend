import React from "react";
import { Eye, Trash2, UserCheck, UserCog } from "lucide-react";
import { formatDate } from "../utils/date";
import {
  displayStatus,
  displayTicketId,
  isSamePerson,
  personLabel,
} from "../utils/issues";
import { CommentSummary, DeadlineBadge, PriorityBadge, StatusBadge } from "./badges";
import { Info } from "./info";

export function IssueDetail({ issue, audience }) {
  return (
    <div className="surface detail-grid">
      <Info label="Ticket ID" value={displayTicketId(issue)} />
      <Info label="Product" value={issue.product} />
      <Info label="Type" value={issue.type} />
      <Info label="Title" value={issue.title} />
      <Info label="Created By" value={personLabel(issue.createdBy)} />
      <Info
        label="Status"
        value={<StatusBadge value={displayStatus(issue, audience)} />}
      />
      <Info label="Priority" value={<PriorityBadge value={issue.priority} />} />
      <Info label="Category" value={issue.category} />
      <Info label="Created Date" value={formatDate(issue.createdAt)} />
      {issue.assignedTo && (
        <Info label="Assigned To" value={personLabel(issue.assignedTo)} />
      )}
      <Info
        label="Developer Comment"
        value={<CommentSummary comment={latestComment(issue)} />}
        wide
      />
    </div>
  );
}

export function TicketDetailModal({ issue, onClose }) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal detail-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ticket details"
      >
        <div className="detail-modal-header">
          <div>
            <span className="ticket-pill">{displayTicketId(issue)}</span>
            <h2>{issue.title}</h2>
            <div className="issue-meta">
              <span>{issue.product}</span>
              <span>{issue.type}</span>
              <span>{issue.category}</span>
            </div>
          </div>
          <StatusBadge value={issue.status} />
        </div>

        <div className="detail-grid">
          <Info label="Created By" value={personLabel(issue.createdBy)} />
          <Info
            label="Priority"
            value={<PriorityBadge value={issue.priority} />}
          />
          <Info label="Created Date" value={formatDate(issue.createdAt)} />
          {issue.deadline && (
            <Info
              label="Deadline"
              value={<DeadlineBadge value={issue.deadline} />}
            />
          )}
          <Info label="Browser / Device" value={issue.browserDevice || "-"} />
          {issue.assignedTo ? (
            <Info label="Assigned To" value={personLabel(issue.assignedTo)} />
          ) : (
            <Info label="Assigned To" value="Unassigned" />
          )}
          <Info
            label="Attachment"
            value={attachmentValue(issue.attachmentUrl)}
            wide
          />
          <Info label="Description" value={longText(issue.description)} wide />
          <Info
            label="Steps to Reproduce"
            value={longText(issue.stepsToReproduce)}
            wide
          />
          <Info
            label="Expected Result"
            value={longText(issue.expectedResult)}
            wide
          />
          <Info
            label="Actual Result"
            value={longText(issue.actualResult)}
            wide
          />
        </div>

        <div className="comment-history">
          <h3>Developer Comments</h3>
          {issue.developerComments?.length ? (
            issue.developerComments.map((comment, index) => (
              <div
                className="comment-entry"
                key={`${comment.updatedAt}-${index}`}
              >
                <span>
                  {comment.oldStatus} → {comment.newStatus}
                </span>
                <p>{comment.comment}</p>
                <small>
                  By {comment.updatedBy || "Developer"} ·{" "}
                  {formatDate(comment.updatedAt)}
                </small>
              </div>
            ))
          ) : (
            <p>No developer comments yet.</p>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export function IssueTable({
  issues,
  currentUser,
  onSelect,
  onView,
  showPending = false,
  onDelete,
  onAssign,
  onSelfAssign,
  audience,
}) {
  return (
    <div className="issue-list">
      {issues.length === 0 && (
        <div className="empty surface">No issues found</div>
      )}
      {issues.map((issue) => {
        const canSelfAssign =
          onSelfAssign &&
          (!issue.assignedTo ||
            (currentUser?.role === "admin" &&
              !isSamePerson(issue.assignedTo, currentUser)));

        return (
          <article
            className={`issue-card surface${issue.status === "Rejected" ? " issue-card--rejected" : ""}`}
            key={issue.id}
          >
            <div className="issue-card-top">
              <span className="ticket-pill">{displayTicketId(issue)}</span>
              <StatusBadge value={displayStatus(issue, audience)} />
            </div>
            <h3>{issue.title}</h3>
            <div className="issue-meta">
              <span>{issue.product}</span>
              <span>{issue.type}</span>
              <span>{issue.category}</span>
            </div>
            <div className="issue-card-grid">
              <Info label="Created By" value={personLabel(issue.createdBy)} />
              <Info
                label="Priority"
                value={<PriorityBadge value={issue.priority} />}
              />
              {showPending && (
                <Info label="Pending" value={`${issue.pendingDays} days`} />
              )}
              <Info label="Created" value={formatDate(issue.createdAt)} />
              {audience !== "user" && issue.deadline && (
                <Info
                  label="Deadline"
                  value={<DeadlineBadge value={issue.deadline} />}
                />
              )}
              {(onAssign || onDelete) && (
                <Info
                  label="Assigned To"
                  value={
                    issue.assignedTo ? (
                      <span className="assigned-chip">
                        {issue.assignedTo.name}
                      </span>
                    ) : (
                      <span className="unassigned-chip">Unassigned</span>
                    )
                  }
                />
              )}
            </div>
            {(onView || onSelect || onDelete || onAssign || canSelfAssign) && (
              <div className="issue-actions">
                {onView && (
                  <button
                    className="small-button"
                    onClick={() => onView(issue)}
                  >
                    <Eye size={16} /> View Details
                  </button>
                )}
                {onSelect && (
                  <button
                    className="small-button"
                    onClick={() => onSelect(issue)}
                  >
                    Update Status
                  </button>
                )}
                {onAssign && (
                  <button
                    className="small-button assign-button"
                    onClick={() => onAssign(issue)}
                  >
                    <UserCog size={16} /> Assign Dev
                  </button>
                )}
                {canSelfAssign && (
                  <button
                    className="small-button assign-button"
                    onClick={() => onSelfAssign(issue)}
                  >
                    <UserCheck size={16} />
                    Assign to Me
                  </button>
                )}
                {onDelete && (
                  <button
                    className="small-button danger-button"
                    onClick={() => onDelete(issue)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function latestComment(issue) {
  return issue.developerComments?.length
    ? issue.developerComments[issue.developerComments.length - 1]
    : null;
}

function longText(value) {
  return value ? <span className="long-text">{value}</span> : "-";
}

function attachmentValue(value) {
  if (!value) return "-";
  if (/^https?:\/\//i.test(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value}
      </a>
    );
  }
  return value;
}
