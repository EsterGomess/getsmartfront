// src/lib/auth.ts
import { api } from "./api";
import type {
    UserLoginPayload,
    UserLoginResponse,
    UserRegisterPayload,
    UserRegisterResponse,
} from "./types";

// ─── Storage keys ──────────────────────────────────────────

const STORAGE_KEYS = {
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

export function saveUserToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
}

export function getUserToken(): string | null {
    // Clear the service token stored by older frontend versions.
    localStorage.removeItem("gg.api_client_token");
    return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
}

export function clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    // Remove the service token stored by earlier versions of the frontend.
    localStorage.removeItem("gg.api_client_token");
}

// ─── User login (layer 2) ──────────────────────────────────

export async function loginUser(
    payload: UserLoginPayload,
): Promise<UserLoginResponse> {
    const response = await api<UserLoginResponse>("/customers/login", {
        method: "POST",
        body: payload,
    });

    saveUserToken(response.access_token);
    return response;
}

// ─── User signup ───────────────────────────────────────────

export async function registerUser(
    payload: UserRegisterPayload,
): Promise<UserRegisterResponse> {
    return api<UserRegisterResponse>("/customers/register", {
        method: "POST",
        body: payload,
    });
}

// ─── Logout ────────────────────────────────────────────────

export function logout(): void {
    emitAuthExpired();
}
