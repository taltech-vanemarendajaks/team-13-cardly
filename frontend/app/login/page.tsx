"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  apiFetch,
  refreshAccessToken,
  setAccessToken,
  setAccessTokenExpires
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AuthResponse {
  accessToken: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handledOAuthRef = useRef(false);

  useEffect(() => {
    const authStatus = searchParams.get("auth");
    if (!authStatus || handledOAuthRef.current) {
      return;
    }

    handledOAuthRef.current = true;

    if (authStatus === "error") {
      setError("Google sign-in failed");
      return;
    }

    if (authStatus !== "success") {
      return;
    }

    const completeGoogleSignIn = async () => {
      setError("");
      setLoading(true);

      try {
        const data = await refreshAccessToken();
        setAccessToken(data.accessToken);
        setAccessTokenExpires(data.accessTokenExpiresIn);
        await refresh();
        router.push("/cards");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed");
        handledOAuthRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    void completeGoogleSignIn();
  }, [refresh, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      setAccessToken(result.accessToken);
      await refresh();
      router.push("/cards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleUrl = new URL("/auth/google", API_BASE);
    googleUrl.searchParams.set("returnTo", "/login");
    window.location.href = googleUrl.toString();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-6 dark:bg-black">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[800px] w-[800px] rounded-full bg-teal-500/[0.08] blur-[160px] dark:bg-teal-500/[0.12]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-sky-500/[0.06] blur-[140px] dark:bg-sky-500/[0.08]" />

      <div
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/[0.10] dark:bg-white/[0.04] dark:shadow-2xl dark:shadow-black/20">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Heart className="h-3.5 w-3.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Cardly
          </span>
        </Link>

        <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Start for free
          </Link>
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/[0.08]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Login With Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-white/[0.10]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white/90 px-3 text-slate-400 dark:bg-black/80 dark:text-slate-500">
              or continue with email
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-white dark:placeholder-slate-500"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/[0.10] dark:bg-white/[0.05] dark:text-white dark:placeholder-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_-2px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.01] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
