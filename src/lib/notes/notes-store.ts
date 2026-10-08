// src/lib/notes/notes-store.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../api";
import { buildAuthContext, withAuthGuard } from "../api-auth";
import { usePaginatedList } from "../use-paginated-list";
import { useResource } from "../use-resource";
import type {
    Note,
    NoteGraph,
    NoteDetailed,
    CreateNoteInput,
    UpdateNoteInput,
    UseNotesOptions,
} from "../types";

// ─── Hooks ─────────────────────────────────────────────────

export function useNotes(options?: UseNotesOptions) {
    const { items, ...rest } = usePaginatedList<Note>(
        "/notes/list",
        options,
        "Failed to load notes",
    );
    return { notes: items, ...rest };
}

export function useNote(id: number) {
    const { item, ...rest } = useResource<Note>(
        "/notes/note",
        id,
        "Failed to load note",
    );
    return { note: item, ...rest };
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

/**
 * Creates a note and navigates to it.
 *
 * If the note was created from within a topic (`input.topic_id` set),
 * the user goes back to the topic page. Otherwise, they land on the
 * note detail page.
 *
 * Used by `/notes/new` and the topic detail page's "New note" button,
 * so the "create + redirect" flow lives in one place.
 */
export function useCreateNote() {
    const router = useRouter();
    return useCallback(
        async (input: CreateNoteInput) => {
            const note = await createNote(input);

            if (input.topic_id) {
                router.push(`/topics/${input.topic_id}`);
            } else {
                router.push(`/notes/${note.id}`);
            }

            return note;
        },
        [router],
    );
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
        const ctx = buildAuthContext();
        // `...input` já carrega `topic_id` quando presente.
        return api<Note>("/notes/create", {
            method: "POST",
            body: { ...input, title, content },
            userToken: ctx.userToken,
        });
    });
}

export async function updateNote(
    id: number,
    patch: UpdateNoteInput,
): Promise<Note> {
    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        return api<Note>(`/notes/note/${id}`, {
            method: "PATCH",
            body: patch,
            userToken: ctx.userToken,
        });
    });
}

export async function deleteNote(id: number): Promise<void> {
    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        await api<void>(`/notes/note/${id}`, {
            method: "DELETE",
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

export async function fetchNoteById(id: number): Promise<NoteDetailed> {
    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        return api<NoteDetailed>(`/notes/note/${id}`, {
            method: "GET",
            userToken: ctx.userToken,
        });
    });
}

export async function fetchNoteGraph(): Promise<NoteGraph> {
    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        return api<NoteGraph>("/notes/graph", {
            method: "GET",
            userToken: ctx.userToken,
        });
    });
}