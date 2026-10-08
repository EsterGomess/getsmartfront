// src/lib/api-auth.ts
"use client";

import { ApiError } from "./api";
import { emitAuthExpired, getUserToken } from "./auth";

// ─── Auth context ──────────────────────────────────────────

export interface AuthContext {
    userToken: string;
}

/**
 * Reads the current user token from storage. Emits `auth-expired` and throws
 * a 401 ApiError when there's no token, so callers can short-circuit cleanly.
 */
export function buildAuthContext(): AuthContext {
    const userToken = getUserToken();
    if (!userToken) {
        emitAuthExpired();
        throw new ApiError(401, "Not authenticated");
    }
    return { userToken };
}

/**
 * Wraps an API call so that any 401 coming from the server also emits
 * `auth-expired`. Re-throws everything else untouched.
 */
export async function withAuthGuard<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            emitAuthExpired();
        }
        throw err;
    }
}