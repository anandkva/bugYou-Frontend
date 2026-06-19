import { useEffect, useState } from "react";

const API_URL = "https://bug-you-backend.vercel.app";
const AUTH_EXPIRED_EVENT = "bugyou:auth-expired";

export function isAuthExpiredError(error) {
  return error?.name === "AuthExpiredError";
}

export function onAuthExpired(listener) {
  window.addEventListener(AUTH_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
}

export function useApi(path, token, deps = []) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ data: null, error: "", loading: true });

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, error: "", loading: true }));
    api(path, { token })
      .then((data) => active && setState({ data, error: "", loading: false }))
      .catch((error) => {
        if (!active) return;
        setState({
          data: null,
          error: isAuthExpiredError(error) ? "" : error.message,
          loading: false,
        });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, token, tick, ...deps]);

  return { ...state, reload: () => setTick((value) => value + 1) };
}

export async function api(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data.message || "Request failed";
    if (isAuthExpiredResponse(response.status, message, Boolean(token))) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      const error = new Error(message);
      error.name = "AuthExpiredError";
      throw error;
    }
    throw new Error(message);
  }
  return data;
}

function isAuthExpiredResponse(status, message, hasToken) {
  return (
    (hasToken && status === 401) ||
    /invalid token|expired token|token expired|invalid or expired/i.test(
      message,
    )
  );
}
