import { apiFetch } from "./api";

export async function startCheckout(plan: "pro" | "business") {
  const res = await apiFetch<{ url?: string; changed?: boolean }>(
    "/billing/checkout",
    { method: "POST", body: { plan } }
  );
  if (res.url) {
    window.location.href = res.url;
  }
  return res;
}

export async function openPortal() {
  const res = await apiFetch<{ url: string }>("/billing/portal");
  window.location.href = res.url;
}

export async function cancelSubscription() {
  return apiFetch<{ ok: boolean }>("/billing/cancel", { method: "POST" });
}
