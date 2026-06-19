import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppMetaFooter, DevBetaBadge, PageHeader } from "../components";

export function DocsPage({ onNavigate, inApp = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onNavigate) onNavigate("report");
    else navigate("/login");
  };

  return (
    <section className={inApp ? "" : "docs-page"}>
      <PageHeader
        title={
          <span className="page-title-brand">
            <span>BugYou Portal Guide</span>
            <DevBetaBadge />
          </span>
        }
        subtitle="Bridging the gap between product users and developers through transparent issue tracking."
        action={
          !inApp && (
            <button className="secondary-button" onClick={handleBack}>
              <Home size={16} /> Back to Login
            </button>
          )
        }
      />

      <div className="docs-grid">
        <article className="surface doc-card">
          <span className="eyebrow">Overview</span>
          <h2>Why BugYou?</h2>
          <p>
            BugYou is an internal issue management platform designed to connect
            end users and developers through a centralized ticketing system.
          </p>
          <p>
            Coordinators, Mentors, Operations Teams, Support Teams, and other
            stakeholders can report bugs and feature requests while developers
            can manage, track, and resolve them efficiently.
          </p>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Problem Solved</span>
          <h2>Reduce Communication Friction</h2>
          <p>
            Before BugYou, issues were reported through WhatsApp, Slack,
            spreadsheets, calls, and emails, making tracking difficult.
          </p>
          <p>
            Every reported issue now receives a unique ticket ID, making it
            easier to track ownership, progress, duplicate reports, and
            resolution history.
          </p>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">End Users</span>
          <h2>Report Issues Easily</h2>
          <p>
            Users can create bug reports and feature requests by providing:
          </p>
          <ul>
            <li>Product Name</li>
            <li>Issue Category</li>
            <li>Priority</li>
            <li>Description</li>
            <li>Steps to Reproduce</li>
            <li>Expected Result</li>
            <li>Actual Result</li>
            <li>Attachment / Screenshot</li>
          </ul>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Ticket Tracking</span>
          <h2>Track Progress Anytime</h2>
          <p>
            Users can use the Track Ticket page to check:
          </p>
          <ul>
            <li>Current Status</li>
            <li>Assigned Developer</li>
            <li>Priority</li>
            <li>Latest Developer Comments</li>
            <li>Resolution Updates</li>
          </ul>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Developer Workflow</span>
          <h2>Efficient Bug Management</h2>
          <p>
            Developers can browse reported issues, self-assign available
            tickets, review complete issue details, and manage assigned work
            through My Tasks.
          </p>
          <p>
            Status updates are performed only from the My Tasks page to ensure
            proper ownership and accountability.
          </p>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Admin Controls</span>
          <h2>Developer & Task Management</h2>
          <p>
            Administrators can:
          </p>
          <ul>
            <li>Create Developer Accounts</li>
            <li>Assign Tickets</li>
            <li>Update Ticket Status</li>
            <li>Delete Invalid Tickets</li>
            <li>Monitor Team Workload</li>
          </ul>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Portal Features</span>
          <h2>Key Features</h2>
          <ul>
            <li>Centralized Issue Tracking</li>
            <li>Duplicate Bug Detection</li>
            <li>Developer Assignment</li>
            <li>Status Management</li>
            <li>Ticket History</li>
            <li>Analytics Dashboard</li>
            <li>Priority Tracking</li>
            <li>Comment History</li>
          </ul>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Available Routes</span>
          <h2>Portal Navigation</h2>
          <ul>
            <li><strong>/login</strong> — Login Page</li>
            <li><strong>/docs</strong> — Portal Documentation</li>
            <li><strong>/report</strong> — Create New Ticket</li>
            <li><strong>/my-tickets</strong> — User Reported Tickets</li>
            <li><strong>/track</strong> — Track Ticket Status</li>
            <li><strong>/dashboard</strong> — Analytics Dashboard</li>
            <li><strong>/manage</strong> — Bug Management</li>
            <li><strong>/my-tasks</strong> — Developer Assigned Tasks</li>
            <li><strong>/manage-devs</strong> — Developer Management</li>
          </ul>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Ticket Lifecycle</span>
          <h2>Issue Workflow</h2>
          <p>
            Reported → Open → Assigned → On Hold → Resolved
          </p>
          <p>
            Or
          </p>
          <p>
            Reported → Open → Rejected
          </p>
          <p>
            Every status change requires a developer comment for transparency.
          </p>
        </article>

        <article className="surface doc-card">
          <span className="eyebrow">Benefits</span>
          <h2>Why Teams Use BugYou</h2>
          <ul>
            <li>Reduced communication overhead</li>
            <li>Clear ownership of issues</li>
            <li>Faster bug resolution</li>
            <li>Easy duplicate issue identification</li>
            <li>Transparent progress tracking</li>
            <li>Complete audit trail of updates</li>
            <li>Improved collaboration between users and developers</li>
          </ul>
        </article>
      </div>

      {!inApp && <AppMetaFooter />}
    </section>
  );
}
