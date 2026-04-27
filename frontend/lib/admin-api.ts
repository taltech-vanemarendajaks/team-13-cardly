const BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("adminKey") ?? "";
}

export function setAdminKey(key: string) {
  sessionStorage.setItem("adminKey", key);
}

export function clearAdminKey() {
  sessionStorage.removeItem("adminKey");
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const key = getAdminKey();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key,
      ...options.headers
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Unauthorized");
    }
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}
