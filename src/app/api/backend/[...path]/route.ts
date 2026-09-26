import type { TokenResponse } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";
const API_PREFIX = process.env.API_PREFIX ?? "/api/v1";
export const runtime = "nodejs";

let cachedApiClientToken: string | null = null;

function isAllowedRoute(path: string[], method: string): boolean {
    const route = path.join("/");
    if (route === "customers/login" || route === "customers/register") {
        return method === "POST";
    }
    if (route === "notes/list" || route === "notes/graph") {
        return method === "GET";
    }
    if (route === "notes/create" || route === "notes/suggest-connections") {
        return method === "POST";
    }
    if (path.length === 3 && path[0] === "notes" && path[1] === "note" && /^\d+$/.test(path[2])) {
        return method === "GET" || method === "PATCH" || method === "DELETE";
    }
    return false;
}

async function getApiClientToken(forceRefresh = false): Promise<string> {
    if (cachedApiClientToken && !forceRefresh) return cachedApiClientToken;

    const username = process.env.API_CLIENT_USERNAME;
    const password = process.env.API_CLIENT_PASSWORD;
    if (!username || !password) throw new Error("API client credentials are not configured");

    const form = new URLSearchParams({ username, password });
    const response = await fetch(`${API_URL}${API_PREFIX}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
        cache: "no-store",
    });
    if (!response.ok) throw new Error("API client authentication failed");

    const data = (await response.json()) as TokenResponse;
    cachedApiClientToken = data.access_token;
    return data.access_token;
}

async function proxyRequest(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
    let failurePhase: "route-validation" | "service-auth" | "backend-request" = "route-validation";
    try {
        const { path } = await params;
        const isWrite = request.method !== "GET" && request.method !== "HEAD";

        if (!isAllowedRoute(path, request.method)) {
            return Response.json({ detail: "Not found" }, { status: 404 });
        }

        // Prevent cross-site form submissions to unauthenticated login/register routes.
        if (isWrite) {
            const origin = request.headers.get("origin");
            if (!origin || origin !== new URL(request.url).origin) {
                return Response.json({ detail: "Forbidden" }, { status: 403 });
            }
        }

        const isPublicAuthRoute = path[0] === "customers";
        const userToken = request.headers.get("x-user-token");
        if (!isPublicAuthRoute && !userToken) {
            return Response.json({ detail: "Not authenticated" }, { status: 401 });
        }

        const incomingUrl = new URL(request.url);
        const targetUrl = `${API_URL}${API_PREFIX}/${path.map(encodeURIComponent).join("/")}${incomingUrl.search}`;
        failurePhase = "service-auth";
        const headers = new Headers({ Authorization: `Bearer ${await getApiClientToken()}` });
        const contentType = request.headers.get("content-type");
        if (contentType) headers.set("Content-Type", contentType);
        if (userToken) headers.set("X-User-Token", userToken);

        const body = isWrite ? await request.text() : undefined;
        failurePhase = "backend-request";
        let upstream = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
            cache: "no-store",
        });

        if (upstream.status === 401) {
            cachedApiClientToken = null;
            failurePhase = "service-auth";
            headers.set("Authorization", `Bearer ${await getApiClientToken(true)}`);
            failurePhase = "backend-request";
            upstream = await fetch(targetUrl, {
                method: request.method,
                headers,
                body,
                cache: "no-store",
            });
        }

        const responseHeaders = new Headers({ "Cache-Control": "no-store" });
        const upstreamContentType = upstream.headers.get("content-type");
        if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType);
        return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    } catch {
        if (process.env.NODE_ENV === "development") {
            console.warn("[backend-proxy] Request failed", { phase: failurePhase });
        }
        return Response.json(
            { detail: "Backend service unavailable" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
