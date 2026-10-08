// src/lib/use-resource.ts
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { buildAuthContext, withAuthGuard } from "./api-auth";

// ─── Hook ──────────────────────────────────────────────────

/**
 * Generic hook for `GET {endpoint}/{id}` endpoints returning a single
 * resource. Resets loading/error when `id` changes.
 *
 * Uses `Object.is` instead of `!==` so that `NaN` (e.g. when a route param
 * fails to parse) does not trigger an infinite re-render loop
 * (`NaN !== NaN` is always true).
 */
export function useResource<T>(
    endpoint: string,
    id: number,
    errorMessage = "Failed to load resource",
) {
    const validId = Number.isFinite(id);

    const [item, setItem] = useState<T | null>(null);
    // For an invalid id we are never "loading" — we already know it will fail.
    const [loading, setLoading] = useState(validId);
    const [error, setError] = useState<string | null>(null);

    // Reset state when the id changes (adjust state during render).
    const [prevId, setPrevId] = useState(id);
    if (!Object.is(prevId, id)) {
        setPrevId(id);
        setItem(null);
        setLoading(validId);
        setError(null);
    }

    useEffect(() => {
        // Guard: don't even try to fetch with an invalid id.
        // State was already set during render — no setState here.
        if (!Number.isFinite(id)) return;

        let cancelled = false;

        (async () => {
            try {
                const data = await withAuthGuard(async () => {
                    const ctx = buildAuthContext();
                    return api<T>(`${endpoint}/${id}`, {
                        method: "GET",
                        userToken: ctx.userToken,
                    });
                });
                if (cancelled) return;
                setItem(data);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof ApiError ? err.detail : errorMessage);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [endpoint, id, errorMessage]);

    return { item, loading, error };
}