import React, { useState } from "react";
import { BookOpen, Bug, LoaderCircle, UserPlus } from "lucide-react";
import { api } from "../api/client";
import {
  AppMetaFooter,
  BrandName,
  Field,
  Notice,
  PasswordField,
} from "../components";

export function AuthScreen({ onSession, onDocs }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: false,
  });

  async function submit(event) {
    event.preventDefault();
    setState({ loading: true, error: "", success: false });
    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            role: "user",
          };

    try {
      const data = await api(endpoint, { method: "POST", body: payload });
      setState({ loading: false, error: "", success: true });
      onSession(data);
    } catch (error) {
      setState({ loading: false, error: error.message, success: false });
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-stack">
        <section className="auth-panel">
          <div className="brand auth-brand">
            <span className="brand-mark">
              <Bug size={22} />
            </span>
            <div>
              <BrandName />
              <small>Calm issue care portal</small>
            </div>
          </div>
          <form onSubmit={submit}>
            <div className="form-heading">
              <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
              <p>
                {mode === "login"
                  ? "Bring every product issue into one gentle, accountable place."
                  : "Start reporting issues with clear ticket tracking."}
              </p>
            </div>
            {mode === "register" && (
              <Field
                label="Name"
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
                required
              />
            )}
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(email) => setForm({ ...form, email })}
              required
            />
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(password) => setForm({ ...form, password })}
              required
            />
            {state.error && <Notice tone="error">{state.error}</Notice>}
            {state.success && (
              <Notice tone="success">
                Login complete. Opening your workspace.
              </Notice>
            )}
            <button className="primary-button" disabled={state.loading}>
              {state.loading && <LoaderCircle className="spin" size={18} />}
              {!state.loading && (mode === "login" ? "Sign in" : "Create user")}
              {state.loading &&
                (mode === "login" ? "Checking account" : "Creating user")}
            </button>
          </form>
          <button
            className="text-button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            <UserPlus size={16} />
            {mode === "login"
              ? "Create a user account"
              : "Already have an account"}
          </button>
          <button className="text-button muted" onClick={onDocs}>
            <BookOpen size={16} />
            View Portal Guide
          </button>
        </section>
        <AppMetaFooter />
      </div>
    </main>
  );
}
