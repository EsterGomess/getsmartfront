// src/lib/auth.ts
import { api } from "@/lib/api";
import type {
    UserLoginPayload,
    UserLoginResponse,
    UserCreatePayload,
    UserRegisterResponse,
    ResetPasswordPayload,
    ForgotPasswordPayload,
} from "./types";

// ─── Storage keys ──────────────────────────────────────────

const USER_TOKEN_KEY = "gg.user_token";
const LEGACY_SERVICE_TOKEN_KEY = "gg.api_client_token";

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
    localStorage.setItem(USER_TOKEN_KEY, token);
}

export function getUserToken(): string | null {
    return localStorage.getItem(USER_TOKEN_KEY);
}

export function clearTokens(): void {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(LEGACY_SERVICE_TOKEN_KEY);
}

// ─── Login ─────────────────────────────────────────────────

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

// ─── Signup ────────────────────────────────────────────────

export async function registerUser(
    payload: UserCreatePayload,
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

// ─── Reset Password ────────────────────────────────────────

export async function resetPassword(
    payload: ResetPasswordPayload,
): Promise<void> {
    await api<void>("/customers/reset-password", {
        method: "POST",
        body: payload,
    });
}

export async function forgotPassword(
    payload: ForgotPasswordPayload,
): Promise<void> {
    await api<void>("/customers/forgot-password", {
        method: "POST",
        body: payload,
    });
}
