"use client";

/** Tiny typed fetch helper for client components calling IronVault API routes. */
export async function api<T = unknown>(
  input: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(input, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      typeof data.error === "string" ? data.error : "حدث خطأ غير متوقع، حاول مجددًا.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
