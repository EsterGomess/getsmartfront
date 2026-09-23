// src/lib/notes-store.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { authenticateApiClient, emitAuthExpired, getUserToken } from "./auth";
import type { Note, NoteType, NoteGraph } from "./types";

// ─── Types ─────────────────────────────────────────────────

export type Zettel = Note;

export interface NotesPageResponse {
    items: Note[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

export interface CreateNoteInput {
    title: string;
    content: string;
    source?: string | null;
    note_type?: NoteType;
}

export interface UpdateNoteInput {
    title?: string;
    content?: string;
    source?: string | null;
    note_type?: NoteType;
}

// ─── Auth context ──────────────────────────────────────────

async function buildAuthContext() {
    const userToken = getUserToken();
    if (!userToken) {
        emitAuthExpired();
        throw new ApiError(401, "Not authenticated");
    }
    const apiClientToken = await authenticateApiClient();
    return { apiClientToken, userToken };
}

async function withAuthGuard<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            emitAuthExpired();
        }
        throw err;
    }
}

// ─── Hooks ─────────────────────────────────────────────────

export interface UseNotesOptions {
    page?: number;
    pageSize?: number;
}

export function useNotes(options?: UseNotesOptions) {
    const [page, setPage] = useState(options?.page ?? 1);
    const [pageSize, setPageSize] = useState(options?.pageSize ?? 12);
    const [notes, setNotes] = useState<Note[]>([]);
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
        prevQuery.page !== page ||
        prevQuery.pageSize !== pageSize ||
        prevQuery.reloadKey !== reloadKey
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
                    const ctx = await buildAuthContext();
                    return api<NotesPageResponse>(
                        `/notes/list?page=${page}&page_size=${pageSize}`,
                        {
                            method: "GET",
                            apiClientToken: ctx.apiClientToken,
                            userToken: ctx.userToken,
                        },
                    );
                });
                if (cancelled) return;
                setNotes(data.items ?? []);
                setTotal(data.total ?? 0);
                setPages(data.pages ?? 1);
            } catch (err) {
                if (cancelled) return;
                setError(
                    err instanceof ApiError ? err.detail : "Failed to load notes",
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [page, pageSize, reloadKey]);

    const refresh = useCallback(() => {
        setReloadKey((k) => k + 1);
    }, []);

    return {
        notes,
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

export function useNote(id: number) {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reset loading when the id changes (adjust state during render).
    const [prevId, setPrevId] = useState(id);
    if (prevId !== id) {
        setPrevId(id);
        setLoading(true);
        setError(null);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await withAuthGuard(async () => {
                    const ctx = await buildAuthContext();
                    return api<Note>(`/notes/note/${id}`, {
                        method: "GET",
                        apiClientToken: ctx.apiClientToken,
                        userToken: ctx.userToken,
                    });
                });
                if (cancelled) return;
                setNote(data);
            } catch (err) {
                if (cancelled) return;
                setError(
                    err instanceof ApiError ? err.detail : "Failed to load note",
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    return { note, loading, error };
}

export function useNoteGraph() {
    const [graph, setGraph] = useState<NoteGraph | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Reset loading when a manual refresh is requested.
    const [prevKey, setPrevKey] = useState(reloadKey);
    if (prevKey !== reloadKey) {
        setPrevKey(reloadKey);
        setLoading(true);
        setError(null);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await fetchNoteGraph();
                if (cancelled) return;
                setGraph(data);
            } catch (err) {
                if (cancelled) return;
                setError(
                    err instanceof ApiError ? err.detail : "Failed to load graph",
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const refresh = useCallback(() => {
        setReloadKey((k) => k + 1);
    }, []);

    return { graph, loading, error, refresh };
}

// ─── Mutations ─────────────────────────────────────────────

export async function createNote(input: CreateNoteInput): Promise<Note> {
    const title = input.title?.trim();
    const content = input.content?.trim();

    if (!title || title.length < 1) {
        throw new ApiError(400, "Title is required");
    }
    if (!content || content.length < 1) {
        throw new ApiError(400, "Content is required");
    }

    return withAuthGuard(async () => {
        const ctx = await buildAuthContext();
        return api<Note>("/notes/create", {
            method: "POST",
            body: { ...input, title, content },
            apiClientToken: ctx.apiClientToken,
            userToken: ctx.userToken,
        });
    });
}

export async function updateNote(
    id: number,
    patch: UpdateNoteInput,
): Promise<Note> {
    return withAuthGuard(async () => {
        const ctx = await buildAuthContext();
        return api<Note>(`/notes/note/${id}`, {
            method: "PATCH",
            body: patch,
            apiClientToken: ctx.apiClientToken,
            userToken: ctx.userToken,
        });
    });
}

export async function deleteNote(id: number): Promise<void> {
    return withAuthGuard(async () => {
        const ctx = await buildAuthContext();
        await api<void>(`/notes/note/${id}`, {
            method: "DELETE",
            apiClientToken: ctx.apiClientToken,
            userToken: ctx.userToken,
        });
    });
}

// ─── Link utilities ────────────────────────────────────────

export const LINK_RE = /\[\[([^\]]+)]]/g;

export function outgoingLinks(note: Note): string[] {
    return Array.from(note.content.matchAll(LINK_RE)).map((m) => m[1].trim());
}

export function findByTitle(all: Note[], title: string): Note | undefined {
    return all.find((n) => n.title.toLowerCase() === title.toLowerCase());
}

export function backlinks(all: Note[], note: Note): Note[] {
    return all.filter(
        (n) =>
            n.id !== note.id &&
            outgoingLinks(n).some(
                (t) => t.toLowerCase() === note.title.toLowerCase(),
            ),
    );
}

export async function fetchNoteById(id: number): Promise<Note> {
    return withAuthGuard(async () => {
        const ctx = await buildAuthContext();
        return api<Note>(`/notes/note/${id}`, {
            method: "GET",
            apiClientToken: ctx.apiClientToken,
            userToken: ctx.userToken,
        });
    });
}

export async function fetchNoteGraph(): Promise<NoteGraph> {
    return withAuthGuard(async () => {
        const ctx = await buildAuthContext();
        return api<NoteGraph>("/notes/graph", {
            method: "GET",
            apiClientToken: ctx.apiClientToken,
            userToken: ctx.userToken,
        });
    });
}