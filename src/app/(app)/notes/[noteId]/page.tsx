// src/app/(app)/notes/[noteId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, Link2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
    deleteNote,
    fetchNoteById,
    updateNote,
    useNotes,
} from "@/lib/notes-store";
import { ApiError } from "@/lib/api";
import type { Note, NoteDetailed, NoteType } from "@/lib/types";
import { SuggestConnections } from "@/components/notes/suggest-connections";
import { NoteBodyEditor } from "@/components/notes/note-body-editor";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
    TYPES,
    NoteTypeBadge,
    labelCls,
    inputCls,
} from "@/components/notes/note-ui";

export default function NoteDetailPage() {
    const params = useParams<{ noteId: string }>();
    const router = useRouter();
    const { notes, refresh: refreshList } = useNotes({ pageSize: 100 });

    const noteId = Number(params.noteId);

    // NoteDetailed charge outgoing_links / incoming_links
    const [note, setNote] = useState<NoteDetailed | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);

    // Reset loading state when noteId changes (adjust state during render).
    const [prevId, setPrevId] = useState(noteId);
    if (prevId !== noteId) {
        setPrevId(noteId);
        setLoading(true);
        setError(null);
    }

    async function load() {
        try {
            const data = await fetchNoteById(noteId);
            setNote(data);
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
                setNote(null);
            } else {
                setError(err instanceof ApiError ? err.detail : "Failed to load note");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await fetchNoteById(noteId);
                if (cancelled) return;
                setNote(data);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 404) {
                    setNote(null);
                } else {
                    setError(err instanceof ApiError ? err.detail : "Failed to load note");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [noteId]);

    async function handleDelete() {
        if (!note) return;
        if (!confirm(`Delete "${note.title}"?`)) return;
        try {
            await deleteNote(note.id);
            toast.success("Note deleted");
            refreshList();
            router.push("/notes");
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) return;
            toast.error("Could not delete note");
        }
    }

    if (loading) {
        return <div className="px-6 py-16 text-center text-neutral-500">Loading...</div>;
    }
    if (error) {
        return <div className="px-6 py-16 text-center text-red-600">{error}</div>;
    }
    if (!note) {
        return (
            <div className="px-6 py-16 text-center text-neutral-600">
                <p className="text-sm">Note not found.</p>
                <Link href="/notes" className="mt-3 inline-block text-xs underline">
                    Back to notes
                </Link>
            </div>
        );
    }

    // Resolve link rows into Note objects using the cached list.
    const resolveNote = (id: number): Note | undefined =>
        notes.find((n) => n.id === id);

    const outgoing = (note.outgoing_links ?? [])
        .map((l) => resolveNote(l.target_note_id))
        .filter((n: Note | undefined): n is Note => Boolean(n));

    const incoming = (note.incoming_links ?? [])
        .map((l) => resolveNote(l.source_note_id))
        .filter((n: Note | undefined): n is Note => Boolean(n));

    return (
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
            <div className="mb-4 flex items-center justify-between">
                <Link
                    href="/notes"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 underline hover:text-neutral-800"
                >
                    <ArrowLeft className="h-3 w-3" /> All notes
                </Link>
                <div className="flex gap-1">
                    <button
                        onClick={() => setEditing(true)}
                        className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label="Edit note"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-red-600"
                        aria-label="Delete note"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <article className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-6">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold text-neutral-800">{note.title}</h1>
                    <NoteTypeBadge type={note.note_type} />
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                    {note.content}
                </p>
            </article>

            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-5">
                    <h2 className="flex items-center gap-2 text-xs uppercase tracking-wide text-neutral-500">
                        <Link2 className="h-3 w-3" /> Links out ({outgoing.length})
                    </h2>
                    <ul className="mt-3 space-y-2">
                        {outgoing.length === 0 && (
                            <li className="text-xs text-neutral-400">No links yet.</li>
                        )}
                        {outgoing.map((n) => (
                            <li key={n.id} className="text-xs">
                                <Link
                                    href={`/notes/${n.id}`}
                                    className="text-neutral-700 underline"
                                >
                                    {n.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-5">
                    <h2 className="text-xs uppercase tracking-wide text-neutral-500">
                        Backlinks ({incoming.length})
                    </h2>
                    <ul className="mt-3 space-y-2">
                        {incoming.length === 0 && (
                            <li className="text-xs text-neutral-400">Nothing links here yet.</li>
                        )}
                        {incoming.map((n) => (
                            <li key={n.id} className="text-xs">
                                <Link
                                    href={`/notes/${n.id}`}
                                    className="text-neutral-700 underline"
                                >
                                    {n.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="mt-6">
                <SuggestConnections
                    title={note.title}
                    content={note.content}
                    onInsertLink={async (noteTitle) => {
                        // Append the [[...]] markup to the stored content and re-save.
                        // The backend will strip it and create the NoteLink.
                        const base = note.content.trimEnd();
                        const next = base
                            ? `${base}\n\n[[${noteTitle}]]`
                            : `[[${noteTitle}]]`;
                        await updateNote(note.id, { content: next });
                        await load();
                        refreshList();
                    }}
                />
            </section>

            {editing && (
                <EditDialog
                    initial={{
                        title: note.title,
                        content: note.content,
                        noteType: note.note_type,
                    }}
                    notes={notes}
                    excludeId={note.id}
                    onClose={() => setEditing(false)}
                    onSave={async (title, content, noteType) => {
                        try {
                            await updateNote(note.id, {
                                title,
                                content,
                                note_type: noteType,
                            });
                            toast.success("Note updated");
                            setEditing(false);
                            await load();
                            refreshList();
                        } catch (err) {
                            if (err instanceof ApiError && err.status === 401) return;
                            toast.error("Could not update note");
                        }
                    }}
                />
            )}
        </main>
    );
}

// ─── Edit dialog ───────────────────────────────────────────

function EditDialog({
                        initial,
                        notes,
                        excludeId,
                        onClose,
                        onSave,
                    }: {
    initial: { title: string; content: string; noteType: NoteType };
    notes: Note[];
    excludeId: number;
    onClose: () => void;
    onSave: (title: string, content: string, noteType: NoteType) => Promise<void>;
}) {
    const [title, setTitle] = useState(initial.title);
    const [content, setContent] = useState(initial.content);
    const [noteType, setNoteType] = useState<NoteType>(initial.noteType);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = title.trim() && content.trim() && !saving;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!title.trim()) return setError("Title is required");
        if (!content.trim()) return setError("Content is required");

        setSaving(true);
        try {
            await onSave(title.trim(), content.trim(), noteType);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) return;
            setError(err instanceof Error ? err.message : "Could not save note.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4"
            onClick={onClose}
        >
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={submit}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-2 border-dashed border-neutral-500 bg-white p-6 shadow-lg"
            >
                <h2 className="text-lg font-semibold text-neutral-800">Edit note</h2>

                <div className="mt-5 space-y-4">
                    <div>
                        <label className={labelCls}>Title</label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Note</label>
                        <NoteBodyEditor
                            value={content}
                            onChange={setContent}
                            notes={notes}
                            excludeId={excludeId}
                            rows={8}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Type</label>
                        <SegmentedControl
                            value={noteType}
                            onValueChange={(v) => setNoteType(v as NoteType)}
                            options={TYPES}
                            name="note_type"
                        />
                    </div>
                </div>

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="rounded bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}