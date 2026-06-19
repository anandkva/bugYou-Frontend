import React from "react";

import { BETA_VERSION, CONTACT_EMAIL } from "../constants";

export function BrandName() {
  return (
    <strong className="brand-name">
      <span>BugYou</span>
      <DevBetaBadge />
    </strong>
  );
}

export function DevBetaBadge() {
  return <span className="dev-beta-badge">Dev Beta</span>;
}

export function AppMetaFooter() {
  return (
    <footer className="app-meta-footer">
      <span>
        Contact for issues:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </span>
      <span>Beta version {BETA_VERSION}</span>
    </footer>
  );
}
