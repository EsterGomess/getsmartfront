// lib/api.ts

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
    userToken?: string;
}

// ─── Fetch wrapper ─────────────────────────────────────────

export async function api<T>(
    path: string,
    options: ApiOptions = {},
): Promise<T> {
    const { method = "GET", body, userToken } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (userToken) {
        headers["X-User-Token"] = userToken;
    }

    // Log only a sanitized route in development; path values and query strings
    // can contain identifiers or user supplied data.
    const route = path.split("?")[0].replace(/\/\d+(?=\/|$)/g, "/:id");

    if (process.env.NODE_ENV === "development") {
        console.debug("[api] Request", { method, route });
    }

    const response = await fetch(`/api/backend${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (process.env.NODE_ENV === "development") {
        console.debug("[api] Response", { method, route, status: response.status });
    }

    // 204 No Content — no body
    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    let data: unknown = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        if (process.env.NODE_ENV === "development") {
            console.warn("[api] Response was not valid JSON", {
                method,
                route,
                status: response.status,
            });
        }
    }

    if (!response.ok) {
        const detail =
            (data as { detail?: string })?.detail ?? "Request failed";
        throw new ApiError(response.status, detail);
    }

    return data as T;
}
