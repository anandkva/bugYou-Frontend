import React from "react";
import { formatShortDate } from "../utils/date";
import { LoadingPanel, Notice } from "./feedback";

export function Metric({ icon: Icon, label, value, color = "teal" }) {
  return (
    <div className={`metric surface metric--${color}`}>
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function IssueTrendChart({ data, loading, error }) {
  const series = data?.series || [];
  const maxCount = Math.max(data?.maxCount || 0, 1);

  return (
    <section className="surface chart-card">
      <div className="chart-header">
        <div>
          <h2>Issue Creation Trend</h2>
          <p>{data?.days || 30} day created count</p>
        </div>
        <strong>{data?.totalCreated || 0} created</strong>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && <LoadingPanel label="Loading trend data" />}
      {!loading && !error && series.length === 0 && (
        <div className="chart-empty">No issues in this period</div>
      )}
      {!loading && series.length > 0 && (
        <>
          <div className="chart-bars">
            {series.map((point, index) => (
              <div className="chart-column" key={point.date}>
                <div
                  className="chart-stack"
                  title={`${point.date}: ${point.total} created`}
                >
                  <span
                    className="chart-segment bugs"
                    style={{
                      height: `${((point.bugs || 0) / maxCount) * 100}%`,
                    }}
                  />
                  <span
                    className="chart-segment requirements"
                    style={{
                      height: `${((point.requirements || 0) / maxCount) * 100}%`,
                    }}
                  />
                </div>
                {(index === 0 ||
                  index === series.length - 1 ||
                  index % 7 === 0) && (
                  <small>{formatShortDate(point.date)}</small>
                )}
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot bugs" /> Bugs
            </span>
            <span>
              <i className="legend-dot requirements" /> New requirements
            </span>
          </div>
        </>
      )}
    </section>
  );
}
