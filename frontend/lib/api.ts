const BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuthRefresh?: boolean;
};

interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresIn: string;
}

let accessToken: string | null = null;
let accessTokenExpiresIn: string | null = null;
let refreshPromise: Promise<RefreshResponse> | null = null;

export function setAccessToken(data: typeof accessToken | null) {
  accessToken = data;
}

export function setAccessTokenExpires(data: typeof accessTokenExpiresIn | null) {
  accessTokenExpiresIn = data;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });

    if (!res.ok) {
      clearAccessToken();
      throw await toError(res);
    }

    const data = (await res.json()) as RefreshResponse;
    setAccessToken(data.accessToken);
    setAccessTokenExpires(data.accessTokenExpiresIn);
    return data;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await request(path, options);

  if (
    response.status === 401 &&
    !options.skipAuthRefresh &&
    path !== "/auth/refresh"
  ) {
    try {
      await refreshAccessToken();
      const retryResponse = await request(path, {
        ...options,
        skipAuthRefresh: true
      });

      if (!retryResponse.ok) {
        throw await toError(retryResponse);
      }

      return (await retryResponse.json()) as T;
    } catch {
      clearAccessToken();
    }
  }

  if (!response.ok) {
    throw await toError(response);
  }

  return response.json() as Promise<T>;
}

async function request(path: string, options: FetchOptions) {
  const { body, skipAuthRefresh, ...rest } = options;
  void skipAuthRefresh;
  const headers = new Headers(rest.headers);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  };

  let res = await fetch(`${BASE}${path}`, init);

  if (res.status === 429) {
    const retryAfter = Math.min(
      Number(res.headers.get("retry-after") || "2"),
      5
    );
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    res = await fetch(`${BASE}${path}`, init);
  }

  return res;
}

async function toError(res: Response) {
  const err = (await res.json().catch(() => ({ message: res.statusText }))) as {
    message?: string;
    error?: string;
  };
  const error = new Error(err.message ?? err.error ?? res.statusText);
  (error as Error & { status: number }).status = res.status;
  return error;
}
