// src/lib/auth.ts
import { api, ApiError } from "./api";
import type {
    TokenResponse,
    UserLoginPayload,
    UserLoginResponse,
    UserRegisterPayload,
    UserRegisterResponse,
} from "./types";

const API_CLIENT_USERNAME = "admin";
const API_CLIENT_PASSWORD = "admin";

// ─── Storage keys ──────────────────────────────────────────

const STORAGE_KEYS = {
    API_CLIENT_TOKEN: "gg.api_client_token",
    USER_TOKEN: "gg.user_token",
} as const;

// ─── Auth-expired event ────────────────────────────────────

const AUTH_EXPIRED_EVENT = "auth:expired";

/**
 * Clears all tokens and notifies the app that the session is gone.
 * Called on logout and on any 401 from the backend.
 */
export function emitAuthExpired(): void {
    clearTokens();
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
}

/**
 * Subscribes to auth-expired events. Returns an unsubscribe function.
 * Used by the authenticated layout to redirect to /login.
 */
export function onAuthExpired(handler: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(AUTH_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
}

// ─── Storage helpers ───────────────────────────────────────

export function saveApiClientToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.API_CLIENT_TOKEN, token);
}

export function getApiClientToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_CLIENT_TOKEN);
}

export function saveUserToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
}

export function getUserToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
}

export function clearApiClientToken(): void {
    localStorage.removeItem(STORAGE_KEYS.API_CLIENT_TOKEN);
}

export function clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.API_CLIENT_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
}

// ─── APIClient authentication (layer 1) ────────────────────

async function fetchFreshApiClientToken(): Promise<string> {
    const form = new URLSearchParams();
    form.append("username", API_CLIENT_USERNAME);
    form.append("password", API_CLIENT_PASSWORD);

    const url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/auth/token`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
    });

    if (!response.ok) {
        throw new ApiError(response.status, "Failed to authenticate APIClient");
    }

    const data: TokenResponse = await response.json();
    saveApiClientToken(data.access_token);
    return data.access_token;
}

export async function authenticateApiClient(): Promise<string> {
    const existing = getApiClientToken();
    if (existing) return existing;
    return fetchFreshApiClientToken();
}

// ─── Shared helper: call API with APIClient + retry on 401 ──

interface ApiCallOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
}

async function callWithApiClientAuth<T>(
    path: string,
    options: ApiCallOptions = {},
): Promise<T> {
    try {
        const token = await authenticateApiClient();
        return await api<T>(path, { ...options, apiClientToken: token });
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            clearApiClientToken();
            const freshToken = await fetchFreshApiClientToken();
            return api<T>(path, { ...options, apiClientToken: freshToken });
        }
        throw err;
    }
}

// ─── User login (layer 2) ──────────────────────────────────

export async function loginUser(
    payload: UserLoginPayload,
): Promise<UserLoginResponse> {
    const response = await callWithApiClientAuth<UserLoginResponse>(
        "/customers/login",
        { method: "POST", body: payload },
    );

    saveUserToken(response.access_token);
    return response;
}

// ─── User signup ───────────────────────────────────────────

export async function registerUser(
    payload: UserRegisterPayload,
): Promise<UserRegisterResponse> {
    return callWithApiClientAuth<UserRegisterResponse>("/customers/register", {
        method: "POST",
        body: payload,
    });
}

// ─── Logout ────────────────────────────────────────────────

export function logout(): void {
    emitAuthExpired();
}