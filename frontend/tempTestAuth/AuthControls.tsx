"use client";

import { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type RefreshSession = {
  accessToken: string;
  accessTokenExpiresIn: string;
};

type AuthControlsProps = {
  authSuccess: boolean;
};

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }

    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    return `${response.status} ${response.statusText}`;
  }

  return `${response.status} ${response.statusText}`;
}

export function AuthControls({ authSuccess }: AuthControlsProps) {
  const [accessToken, setAccessToken] = useState("");
  const [status, setStatus] = useState("Use the buttons below to test Google OAuth.");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!authSuccess) {
      return;
    }

    void refreshAccessToken("Testing authToken:");
  }, [authSuccess]);

  async function refreshAccessToken(logLabel: string) {
    setIsRefreshing(true);
    setStatus("Requesting a new access token...");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const payload = (await response.json()) as RefreshSession;
      setAccessToken(payload.accessToken);
      setStatus(`Access token ready (${payload.accessTokenExpiresIn}). Check the browser console.`);
      console.log(logLabel, payload.accessToken);
    } catch (requestError) {
      setAccessToken("");
      setStatus(requestError instanceof Error ? requestError.message : "Unable to refresh session");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function logout() {
    if (!accessToken) {
      setStatus("Fetch an access token before calling logout.");
      return;
    }

    setIsLoggingOut(true);
    setStatus("Calling /auth/logout...");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setAccessToken("");
      setStatus("Logged out. Refresh should now fail until you sign in again.");
      console.log("Logged out successfully");
    } catch (requestError) {
      setStatus(requestError instanceof Error ? requestError.message : "Unable to log out");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function loginWithGoogle() {
    window.location.href = `${apiBaseUrl}/auth/google`;
  }

  return (
    <section className="flex w-full max-w-3xl flex-col items-center gap-5 rounded-2xl border bg-card px-6 py-7 shadow-sm">
      <div className="max-w-2xl space-y-2 text-center">
        <h2 className="text-xl font-semibold">Auth Review</h2>
        <p className="text-sm text-muted-foreground">
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          onClick={loginWithGoogle}
          type="button"
        >
          Login With Google
        </button>
        <button
          className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing}
          onClick={() => void refreshAccessToken("New access token:")}
          type="button"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Token"}
        </button>
        <button
          className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!accessToken || isLoggingOut}
          onClick={() => void logout()}
          type="button"
        >
          {isLoggingOut ? "Logging Out..." : "Logout"}
        </button>
      </div>
      <p className="max-w-2xl text-center text-sm text-muted-foreground">{status}</p>
    </section>
  );
}
