// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

// ─── Custom error ──────────────────────────────────────────

export class ApiError extends Error {
    constructor(
        public status: number,
        public detail: string,
    ) {
        super(detail);
        this.name = "ApiError";
    }
}

// ─── Fetch options ─────────────────────────────────────────

interface ApiOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    apiClientToken?: string;
    userToken?: string;
}

// ─── Fetch wrapper ─────────────────────────────────────────

export async function api<T>(
    path: string,
    options: ApiOptions = {},
): Promise<T> {
    const { method = "GET", body, apiClientToken, userToken } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (apiClientToken) {
        headers["Authorization"] = `Bearer ${apiClientToken}`;
    }
    if (userToken) {
        headers["X-User-Token"] = userToken;
    }

    const url = `${API_URL}${API_PREFIX}${path}`;

    // [TEMP LOG]
    console.log("[api] Request:", {
        method,
        url,
        hasApiClientToken: !!apiClientToken,
        hasUserToken: !!userToken,
        body,
    });

    const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // [TEMP LOG]
    console.log("[api] Response:", {
        status: response.status,
        ok: response.ok,
        url,
    });

    // 204 No Content — no body
    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    let data: unknown = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // [TEMP LOG]
        console.error("[api] Failed to parse JSON. Raw body:", text);
    }

    if (!response.ok) {
        // [TEMP LOG]
        console.error("[api] Request failed. Body:", data);

        const detail =
            (data as { detail?: string })?.detail ?? "Request failed";
        throw new ApiError(response.status, detail);
    }

    return data as T;
}