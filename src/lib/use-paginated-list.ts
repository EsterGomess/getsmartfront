// src/lib/use-paginated-list.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { buildAuthContext, withAuthGuard } from "./api-auth";
import type { PaginatedResponse, UsePaginatedListOptions } from "./types";

// ─── Hook ──────────────────────────────────────────────────

/**
 * Generic hook for `GET {endpoint}?page=&page_size=` endpoints that return
 * a paginated envelope. Backed by the same load/refresh/cancel pattern used
 * by useNotes / useTopics, so pagination bugs are fixed in one place.
 *
 * Uses `Object.is` for change detection so `NaN` values do not trigger
 * infinite re-renders.
 */
export function usePaginatedList<T>(
    endpoint: string,
    options?: UsePaginatedListOptions,
    errorMessage = "Failed to load items",
) {
    const [page, setPage] = useState(options?.page ?? 1);
    const [pageSize, setPageSize] = useState(options?.pageSize ?? 12);
    const [items, setItems] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Adjust state during render: when the query changes, reset loading/error
    // before React commits. This is the React-recommended pattern and does
    // NOT trigger the "set-state-in-effect" rule.
    const [prevQuery, setPrevQuery] = useState({ page, pageSize, reloadKey });
    if (
        !Object.is(prevQuery.page, page) ||
        !Object.is(prevQuery.pageSize, pageSize) ||
        !Object.is(prevQuery.reloadKey, reloadKey)
    ) {
        setPrevQuery({ page, pageSize, reloadKey });
        setLoading(true);
        setError(null);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await withAuthGuard(async () => {
                    const ctx = buildAuthContext();
                    return api<PaginatedResponse<T>>(
                        `${endpoint}?page=${page}&page_size=${pageSize}`,
                        {
                            method: "GET",
                            userToken: ctx.userToken,
                        },
                    );
                });
                if (cancelled) return;
                setItems(data.items ?? []);
                setTotal(data.total ?? 0);
                setPages(data.pages ?? 1);
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
    }, [endpoint, page, pageSize, reloadKey, errorMessage]);

    const refresh = useCallback(() => {
        setReloadKey((k) => k + 1);
    }, []);

    return {
        items,
        total,
        page,
        pageSize,
        pages,
        loading,
        error,
        refresh,
        setPage,
        setPageSize,
    };
}