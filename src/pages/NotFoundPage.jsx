import React from "react";
import { Bug, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { BrandName } from "../components";

export function NotFoundPage({ homePath }) {
  return (
    <main className="not-found-page">
      <section className="not-found-panel surface">
        <div className="brand auth-brand">
          <span className="brand-mark">
            <Bug size={22} />
          </span>
          <div>
            <BrandName />
            <small>Issue tracking</small>
          </div>
        </div>
        <div className="form-heading">
          <h1>Page not found</h1>
          <p>The route you opened does not exist in this portal.</p>
        </div>
        <NavLink className="primary-button" to={homePath}>
          <Home size={17} />
          Go to portal
        </NavLink>
      </section>
    </main>
  );
}
