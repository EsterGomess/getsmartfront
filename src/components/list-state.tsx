// components/list-state.tsx
"use client";

import { StateBox } from "@/components/notes/note-ui";

// ─── Sub-components ────────────────────────────────────────

export function ListLoading({ label = "Loading…" }: { label?: string }) {
    return <StateBox>{label}</StateBox>;
}

export function ListError({ message }: { message: string }) {
    return <StateBox tone="error">{message}</StateBox>;
}

export function ListEmpty({
                              icon = "📁",
                              message,
                          }: {
    icon?: string;
    message: string;
}) {
    return (
        <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100 text-2xl">
                {icon}
            </div>
            <p className="text-sm text-neutral-500">{message}</p>
        </div>
    );
}

// ─── Wrapper ───────────────────────────────────────────────

export interface ListStateProps<T> {
    loading: boolean;
    error: string | null;
    items: T[];
    emptyMessage: string;
    emptyIcon?: string;
    loadingLabel?: string;
    children: React.ReactNode;
}

/**
 * Renders `children` only when there is data to show; otherwise shows the
 * loading / error / empty state. Uses the shared `StateBox` so the visual
 * matches the rest of the app.
 */
export function ListState<T>({
                                 loading,
                                 error,
                                 items,
                                 emptyMessage,
                                 emptyIcon,
                                 loadingLabel,
                                 children,
                             }: ListStateProps<T>) {
    if (loading) return <ListLoading label={loadingLabel} />;
    if (error) return <ListError message={error} />;
    if (items.length === 0)
        return <ListEmpty icon={emptyIcon} message={emptyMessage} />;
    return <>{children}</>;
}