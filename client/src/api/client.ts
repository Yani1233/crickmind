export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error", code: "UNKNOWN" }));
    throw new ApiClientError(res.status, body.code ?? "UNKNOWN", body.error ?? "Request failed");
  }

  const json = await res.json();
  return json.data;
}
