// src/app/(app)/notes/[noteId]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    Link2,
    ArrowLeft,
    ExternalLink,
    Check,
    ChevronDown,
    Search,
    X,
} from "lucide-react";
import { toast } from "sonner";

import {
    deleteNote,
    fetchNoteById,
    updateNote,
    useNotes,
} from "@/lib/notes/notes-store";
import { useTopics } from "@/lib/topics-store";
import { ApiError } from "@/lib/api";
import type { Note, NoteDetailed, NoteType, Topic } from "@/lib/types";
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
    const { topics } = useTopics({ pageSize: 100 });

    const noteId = Number(params.noteId);

    const [note, setNote] = useState<NoteDetailed | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);

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

    const resolveNote = (id: number): Note | undefined =>
        notes.find((n) => n.id === id);

    const outgoing = (note.outgoing_links ?? [])
        .map((l) => resolveNote(l.target_note_id))
        .filter((n: Note | undefined): n is Note => Boolean(n));

    const incoming = (note.incoming_links ?? [])
        .map((l) => resolveNote(l.source_note_id))
        .filter((n: Note | undefined): n is Note => Boolean(n));

    const currentTopic = note.topic_id
        ? topics.find((t) => t.id === note.topic_id)
        : null;

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
                    <h1 className="text-xl font-semibold text-neutral-800">
                        {note.title}
                    </h1>
                    <NoteTypeBadge type={note.note_type} />
                </div>

                {currentTopic && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
                        <span className="font-medium uppercase tracking-wide text-[10px] text-neutral-400">
                            Topic:
                        </span>
                        <Link
                            href={`/topics/${currentTopic.id}`}
                            className="truncate underline hover:text-neutral-900"
                        >
                            {currentTopic.title}
                        </Link>
                    </div>
                )}

                {note.source ? (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="font-medium uppercase tracking-wide text-[10px] text-neutral-400">
                            Source:
                        </span>
                        {/^https?:\/\//i.test(note.source) ? (
                            <a
                                href={note.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate underline hover:text-neutral-900"
                            >
                                {note.source}
                            </a>
                        ) : (
                            <span className="truncate">{note.source}</span>
                        )}
                    </div>
                ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="font-medium uppercase tracking-wide text-[10px]">
                            Source:
                        </span>
                        <span className="italic">none</span>
                    </div>
                )}

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
                            <li className="text-xs text-neutral-400">
                                Nothing links here yet.
                            </li>
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
                        source: note.source ?? "",
                        topicId: note.topic_id ?? null,
                    }}
                    notes={notes}
                    topics={topics}
                    excludeId={note.id}
                    onClose={() => setEditing(false)}
                    onSave={async (title, content, noteType, source, topicId) => {
                        try {
                            await updateNote(note.id, {
                                title,
                                content,
                                note_type: noteType,
                                source: source.trim() ? source.trim() : null,
                                topic_id: topicId,
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

// ─── Topic combobox (cross-device, com busca) ──────────────

function TopicCombobox({
                           topics,
                           value,
                           onChange,
                       }: {
    topics: Topic[];
    value: number | null;
    onChange: (id: number | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = value ? topics.find((t) => t.id === value) ?? null : null;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return topics;
        return topics.filter((t) => t.title.toLowerCase().includes(q));
    }, [topics, query]);

    // Close on outside click / Escape.
    useEffect(() => {
        if (!open) return;
        function onDoc(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    // Focus search when opening.
    useEffect(() => {
        if (open) inputRef.current?.focus();
        else setQuery("");
    }, [open]);

    function pick(id: number | null) {
        onChange(id);
        setOpen(false);
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`${inputCls} flex w-full items-center justify-between gap-2 text-left`}
            >
                <span className={selected ? "truncate" : "truncate text-neutral-400"}>
                    {selected ? selected.title : "No topic"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
            </button>

            {open && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-neutral-300 bg-white shadow-lg">
                    {/* Search */}
                    <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2">
                        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search topics…"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                aria-label="Clear"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Options */}
                    <ul className="max-h-56 overflow-y-auto py-1 text-sm">
                        <li>
                            <button
                                type="button"
                                onClick={() => pick(null)}
                                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-neutral-600 hover:bg-neutral-50"
                            >
                                <span className="italic">No topic</span>
                                {value === null && (
                                    <Check className="h-4 w-4 text-neutral-500" />
                                )}
                            </button>
                        </li>

                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-xs text-neutral-400">
                                No topic matches your search.
                            </li>
                        )}

                        {filtered.map((t) => {
                            const isSelected = t.id === value;
                            return (
                                <li key={t.id}>
                                    <button
                                        type="button"
                                        onClick={() => pick(t.id)}
                                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-50 ${
                                            isSelected
                                                ? "bg-neutral-50 text-neutral-900"
                                                : "text-neutral-700"
                                        }`}
                                    >
                                        <span className="truncate">{t.title}</span>
                                        {isSelected && (
                                            <Check className="h-4 w-4 shrink-0 text-neutral-500" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ─── Edit dialog ───────────────────────────────────────────

function EditDialog({
                        initial,
                        notes,
                        topics,
                        excludeId,
                        onClose,
                        onSave,
                    }: {
    initial: {
        title: string;
        content: string;
        noteType: NoteType;
        source: string;
        topicId: number | null;
    };
    notes: Note[];
    topics: Topic[];
    excludeId: number;
    onClose: () => void;
    onSave: (
        title: string,
        content: string,
        noteType: NoteType,
        source: string,
        topicId: number | null,
    ) => Promise<void>;
}) {
    const [title, setTitle] = useState(initial.title);
    const [content, setContent] = useState(initial.content);
    const [noteType, setNoteType] = useState<NoteType>(initial.noteType);
    const [source, setSource] = useState(initial.source);
    const [topicId, setTopicId] = useState<number | null>(initial.topicId);
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
            await onSave(title.trim(), content.trim(), noteType, source, topicId);
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
                        <label className={labelCls}>Topic</label>
                        <TopicCombobox
                            topics={topics}
                            value={topicId}
                            onChange={setTopicId}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Source</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="e.g. Book title, article, or https://example.com"
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