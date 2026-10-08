// src/app/(app)/topics/[topicId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Trash2,
    FilePlus,
    Search,
    Link2,
} from "lucide-react";

import { deleteTopic, useTopic } from "@/lib/topics-store";
import { outgoingLinks } from "@/lib/notes/notes-store";
import { api, ApiError } from "@/lib/api";
import { buildAuthContext, withAuthGuard } from "@/lib/api-auth";
import { Pagination } from "@/components/pagination";
import { NoteTypeBadge } from "@/components/notes/note-ui";
import { PageShell } from "@/components/page-shell";
import { ListState } from "@/components/list-state";
import type { Note, Topic } from "@/lib/types";

// ─── Constants ─────────────────────────────────────────────

const DEFAULT_COLOR = "bg-neutral-200";
const DEFAULT_ICON = "📁";

// ─── Page ──────────────────────────────────────────────────

export default function TopicDetailPage() {
    const params = useParams<{ topicId: string }>();
    const rawId = params?.topicId;
    const topicId = Number(rawId);

    if (!Number.isFinite(topicId) || topicId <= 0) {
        return <TopicNotFound />;
    }

    return <TopicDetail key={topicId} topicId={topicId} />;
}

// ─── Content ───────────────────────────────────────────────

function TopicDetail({ topicId }: { topicId: number }) {
    const router = useRouter();
    const { topic, loading, error } = useTopic(topicId);

    const [mode, setMode] = useState<"list" | "study">("list");
    const [query, setQuery] = useState("");

    if (loading) {
        return (
            <PageShell>
                <p className="text-sm text-neutral-500">Loading topic…</p>
            </PageShell>
        );
    }

    if (error || !topic) {
        return <TopicNotFound message={error ?? "Topic not found."} />;
    }

    return (
        <PageShell>
            {/* ─── Top bar ─────────────────────────────── */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/topics"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> All topics
                </Link>
                <button
                    onClick={async () => {
                        if (!window.confirm(`Delete "${topic.title}"?`)) return;
                        await deleteTopic(topic.id);
                        router.push("/topics");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600"
                >
                    <Trash2 className="h-3.5 w-3.5" /> Delete topic
                </button>
            </div>

            {/* ─── Header ──────────────────────────────── */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded border border-neutral-400 text-2xl ${DEFAULT_COLOR}`}
                    >
                        {DEFAULT_ICON}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-800">
                            {topic.title}
                        </h1>
                        {topic.description && (
                            <p className="mt-1 text-sm text-neutral-500">
                                {topic.description}
                            </p>
                        )}
                    </div>
                </div>

                <Link
                    href={`/notes/new?topic_id=${topic.id}`}
                    className="inline-flex items-center gap-2 rounded border-2 border-dashed border-neutral-500 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                    <FilePlus className="h-4 w-4" /> New note
                </Link>
            </div>

            {/* ─── Toggle + Search (mesma linha) ───────── */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex shrink-0 gap-1 rounded border border-dashed border-neutral-400 bg-white p-1">
                    <button
                        onClick={() => setMode("list")}
                        className={`rounded px-3 py-1 text-xs ${
                            mode === "list"
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-600"
                        }`}
                    >
                        List
                    </button>
                    <button
                        type="button"
                        disabled
                        title="Study mode is not available yet."
                        className="cursor-not-allowed rounded px-3 py-1 text-xs text-neutral-600 opacity-40"
                    >
                        Study
                    </button>
                </div>

                <div className="flex flex-1 items-center gap-2 rounded border border-neutral-300 bg-white px-3 py-2">
                    <Search className="h-4 w-4 text-neutral-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search notes or text"
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            {/* ─── Notes list (paginada) ───────────────── */}
            <TopicNotes topicId={topic.id} query={query} />
        </PageShell>
    );
}

// ─── Notas do tópico ───────────────────────────────────────

type TopicWithNotes = Topic & {
    notes?: Note[];
    pagination?: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
};

function useTopicNotes(topicId: number, pageSize = 12) {
    const [page, setPage] = useState(1);
    const [notes, setNotes] = useState<Note[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [prevPage, setPrevPage] = useState(page);
    if (!Object.is(prevPage, page)) {
        setPrevPage(page);
        setLoading(true);
        setError(null);
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await withAuthGuard(async () => {
                    const ctx = buildAuthContext();
                    return api<TopicWithNotes>(
                        `/topics/${topicId}?page=${page}&page_size=${pageSize}`,
                        { method: "GET", userToken: ctx.userToken },
                    );
                });
                if (cancelled) return;

                setNotes(data.notes ?? []);
                setTotal(data.pagination?.total ?? data.notes?.length ?? 0);
                setPages(data.pagination?.total_pages ?? 1);
            } catch (err) {
                if (cancelled) return;
                setError(
                    err instanceof ApiError
                        ? err.detail
                        : "Failed to load topic notes",
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [topicId, page, pageSize]);

    return {
        notes,
        total,
        page,
        pages,
        pageSize,
        loading,
        error,
        setPage,
    };
}

function TopicNotes({
                        topicId,
                        query,
                    }: {
    topicId: number;
    query: string;
}) {
    const {
        notes,
        total,
        page,
        pages,
        pageSize,
        loading,
        error,
        setPage,
    } = useTopicNotes(topicId, 12);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return notes;
        return notes.filter(
            (n) =>
                n.title.toLowerCase().includes(q) ||
                n.content.toLowerCase().includes(q),
        );
    }, [notes, query]);

    const isSearching = query.trim().length > 0;

    return (
        <ListState
            loading={loading}
            error={error}
            items={filtered}
            loadingLabel="Loading notes..."
            emptyIcon="🗂️"
            emptyMessage={
                notes.length === 0
                    ? 'No notes in this topic yet. Click "New note" to write your first one.'
                    : "No note matches your search."
            }
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((n) => (
                    <NoteCard key={n.id} note={n} />
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
    );
}

// ─── Card (idêntico ao de /notes) ──────────────────────────

function NoteCard({ note }: { note: Note }) {
    return (
        <Link
            href={`/notes/${note.id}`}
            className="flex flex-col rounded-lg border-2 border-dashed border-neutral-400 bg-white p-5 transition hover:border-neutral-600"
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-neutral-800">
                    {note.title}
                </h3>
                <NoteTypeBadge type={note.note_type} />
            </div>
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-neutral-500">
                {note.content}
            </p>
            <p className="mt-3 flex items-center gap-1 text-[11px] text-neutral-400">
                <Link2 className="h-3 w-3" /> {outgoingLinks(note).length} links
            </p>
        </Link>
    );
}

// ─── Not found ─────────────────────────────────────────────

function TopicNotFound({ message = "Topic not found." }: { message?: string }) {
    return (
        <PageShell>
            <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-10 text-center">
                <p className="text-sm text-neutral-500">{message}</p>
                <Link
                    href="/topics"
                    className="mt-4 inline-block text-xs text-neutral-500 underline"
                >
                    Back to topics
                </Link>
            </div>
        </PageShell>
    );
}