const BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers ?? {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  };

  let res = await fetch(`${BASE}${path}`, init);

  // Auto-retry once on 429 after the server-suggested delay (capped at 5s)
  if (res.status === 429) {
    const retryAfter = Math.min(
      Number(res.headers.get("retry-after") || "2"),
      5
    );
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    res = await fetch(`${BASE}${path}`, init);
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string;
    };
    const error = new Error(err.error ?? res.statusText);
    (error as Error & { status: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}
