import { startOfDay } from "./date";

export function summarizeByStatus(issues) {
  return issues.reduce(
    (summary, issue) => {
      if (issue.status === "Open") summary.open += 1;
      if (issue.status === "On Hold") summary.onHold += 1;
      if (issue.status === "Resolved") summary.resolved += 1;
      if (issue.status === "Rejected") summary.rejected += 1;
      return summary;
    },
    { open: 0, onHold: 0, resolved: 0, rejected: 0 },
  );
}

export function splitIssuesByType(issues) {
  return issues.reduce(
    (groups, issue) => {
      if (issue.type === "New Requirement") groups.requirements.push(issue);
      else groups.bugs.push(issue);
      return groups;
    },
    { bugs: [], requirements: [] },
  );
}

export function displayStatus(issue, audience) {
  if (audience === "user" && issue.assignedTo && issue.status === "Open")
    return "Assigned";
  return issue.status;
}

export function displayTicketId(issue) {
  const ticketId = issue?.ticketId || "-";
  if (issue?.type === "New Requirement") return ticketId.replace(/^BUG/i, "NR");
  return ticketId.replace(/^NR/i, "BUG");
}

export function backendTicketId(ticketId) {
  return ticketId.trim().toUpperCase();
}

export function deadlineState(value) {
  if (!value) return { label: "-", tone: "ok" };
  const dateValue = String(value).slice(0, 10);
  const today = startOfDay(new Date());
  const deadline = startOfDay(new Date(`${dateValue}T00:00:00`));
  const daysLeft = Math.ceil((deadline - today) / 86400000);

  if (Number.isNaN(daysLeft)) return { label: value, tone: "ok" };
  if (daysLeft < 0)
    return { label: `Overdue ${Math.abs(daysLeft)}d`, tone: "urgent" };
  if (daysLeft === 0) return { label: "Due today", tone: "urgent" };
  if (daysLeft === 1) return { label: "1 day left", tone: "urgent" };
  return { label: `${daysLeft} days left`, tone: "ok" };
}

export function dateFilterParams(filter) {
  if (filter === "all") return {};
  const start = new Date();
  start.setDate(start.getDate() - (filter === "last-week" ? 7 : 30));
  return { startDate: start.toISOString().slice(0, 10) };
}

export function personLabel(person) {
  if (!person) return "-";
  if (person.name && person.email) return `${person.name} (${person.email})`;
  return person.name || person.email || "-";
}

export function isSamePerson(left, right) {
  if (!left || !right) return false;
  if (left.id && right.id) return left.id === right.id;
  if (left.email && right.email) return left.email === right.email;
  return left.name && right.name && left.name === right.name;
}
