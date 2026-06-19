import React from "react";

export function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? "info wide" : "info"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
