import React from "react";
import { Frown, LoaderCircle, Smile } from "lucide-react";

export function Notice({ tone, children }) {
  const Icon = tone === "success" ? Smile : Frown;
  return (
    <div className={`notice ${tone}`}>
      <Icon size={18} /> <span>{children}</span>
    </div>
  );
}

export function LoadingPanel({ label }) {
  return (
    <div className="loading-panel surface">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}
