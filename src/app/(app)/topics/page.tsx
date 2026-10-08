// src/app/(app)/topics/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FolderPlus, Pencil, Search } from "lucide-react";
import Link from "next/link";
import {
    createTopic,
    deleteTopic,
    updateTopic,
    useTopics,
} from "@/lib/topics-store";
import type { Topic } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { ListState } from "@/components/list-state";
import { Modal } from "@/components/modal";
import { Pagination } from "@/components/pagination";

// ─── Constants ─────────────────────────────────────────────

const DEFAULT_COLOR = "bg-neutral-200";
const DEFAULT_ICON = "📁";

// ─── Types ─────────────────────────────────────────────────

type DialogState =
    | { mode: "create" }
    | { mode: "edit"; topic: Topic }
    | null;

// ─── Page ──────────────────────────────────────────────────

export default function TopicsPage() {
    const {
        topics,
        loading,
        error,
        refresh,
        page,
        pages,
        total,
        pageSize,
        setPage,
    } = useTopics({ pageSize: 12 });

    const [dialog, setDialog] = useState<DialogState>(null);
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return topics;
        return topics.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q),
        );
    }, [topics, query]);

    const isSearching = query.trim().length > 0;

    return (
        <PageShell>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-800">
                        Your topics
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Create folders to organize your notes.
                    </p>
                </div>
                <button
                    onClick={() => setDialog({ mode: "create" })}
                    className="inline-flex items-center gap-2 rounded border-2 border-dashed border-neutral-500 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                    <FolderPlus className="h-4 w-4" />
                    New topic
                </button>
            </div>

            {/* ─── Search ──────────────────────────────── */}
            <div className="mb-6 flex items-center gap-2 rounded border border-neutral-300 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search topics"
                    className="w-full bg-transparent text-sm outline-none"
                />
            </div>

            <ListState
                loading={loading}
                error={error}
                items={filtered}
                loadingLabel="Loading topics…"
                emptyMessage={
                    topics.length === 0
                        ? 'No topics yet. Click "New topic" to get started.'
                        : "No topic matches your search."
                }
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((t) => (
                        <TopicCard
                            key={t.id}
                            topic={t}
                            onEdit={() => setDialog({ mode: "edit", topic: t })}
                            onDelete={async () => {
                                if (!window.confirm(`Delete "${t.title}"?`)) return;
                                await deleteTopic(t.id);
                                refresh();
                            }}
                        />
                    ))}
                </div>

                <Pagination
                    page={page}
                    pages={pages}
                    total={isSearching ? filtered.length : total}
                    pageSize={pageSize}
                    onPageChange={(newPage) => {
                        setPage(newPage);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            </ListState>

            {dialog && (
                <TopicDialog
                    state={dialog}
                    onClose={() => setDialog(null)}
                    onSaved={refresh}
                />
            )}
        </PageShell>
    );
}

// ─── Card ──────────────────────────────────────────────────

function TopicCard({
                       topic,
                       onEdit,
                       onDelete,
                   }: {
    topic: Topic;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="group relative rounded-lg border-2 border-dashed border-neutral-400 bg-white p-5 transition hover:border-neutral-600">
            <Link href={`/topics/${topic.id}`} className="block">
                <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded border border-neutral-400 text-xl ${DEFAULT_COLOR}`}
                >
                    {DEFAULT_ICON}
                </div>
                <h3 className="text-sm font-semibold text-neutral-800">
                    {topic.title}
                </h3>
                {topic.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                        {topic.description}
                    </p>
                )}
            </Link>
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                    onClick={onEdit}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
                    aria-label="Edit topic"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                    aria-label="Delete topic"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ─── Dialog ────────────────────────────────────────────────

function TopicDialog({
                         state,
                         onClose,
                         onSaved,
                     }: {
    state: Exclude<DialogState, null>;
    onClose: () => void;
    onSaved: () => void;
}) {
    const editing = state.mode === "edit" ? state.topic : null;
    const [title, setTitle] = useState(editing?.title ?? "");
    const [description, setDescription] = useState(editing?.description ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            if (editing) {
                await updateTopic(editing.id, {
                    title: title.trim(),
                    description: description.trim(),
                });
            } else {
                await createTopic({
                    title: title.trim(),
                    description: description.trim(),
                });
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save topic");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal onClose={onClose}>
            <form onSubmit={submit}>
                <h2 className="text-lg font-semibold text-neutral-800">
                    {editing ? "Edit topic" : "New topic"}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                    {editing
                        ? "Update this folder's details."
                        : "A folder to group notes."}
                </p>

                <div className="mt-5 space-y-4">
                    <div>
                        <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                            Title
                        </label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Project ideas"
                            className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional"
                            rows={2}
                            className="w-full resize-none rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                        />
                    </div>
                </div>

                {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                        {submitting ? "Saving…" : editing ? "Save" : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}