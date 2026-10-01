// src/app/(app)/notes/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus, Search, Link2 } from "lucide-react";

import { outgoingLinks, useNotes } from "@/lib/notes-store";
import { NotesPagination } from "@/components/notes/notes-pagination";
import { StateBox, NoteTypeBadge } from "@/components/notes/note-ui";

export default function NotesPage() {
    const {
        notes,
        total,
        page,
        pages,
        pageSize,
        loading,
        error,
        setPage,
    } = useNotes({ pageSize: 12 });

    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return notes;
        return notes.filter(
            (n) =>
                n.title.toLowerCase().includes(q) ||
                n.content.toLowerCase().includes(q),
        );
    }, [notes, query]);

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-800">
                        Your notes
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        A Zettelkasten: one idea per note, connected by links. Type{" "}
                        <kbd className="rounded border border-neutral-300 bg-neutral-50 px-1 py-0.5 font-mono text-[11px]">
                            [[
                        </kbd>{" "}
                        while writing to reference another — backlinks appear
                        automatically.
                    </p>
                </div>


                <Link
                    href="/notes/new"
                    className="inline-flex items-center gap-2 rounded border-2 border-dashed border-neutral-500 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                    <FilePlus className="h-4 w-4" /> New note
                </Link>
            </div>

            <div className="mb-6 flex items-center gap-2 rounded border border-neutral-300 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notes or text"
                    className="w-full bg-transparent text-sm outline-none"
                />
            </div>

            {loading && <StateBox>Loading notes...</StateBox>}
            {error && !loading && <StateBox tone="error">{error}</StateBox>}

            {!loading && !error && filtered.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100 text-2xl">
                        🗂️
                    </div>
                    <p className="text-sm text-neutral-500">
                        {notes.length === 0
                            ? 'No notes yet. Click "New note" to write your first one.'
                            : "No note matches your search."}
                    </p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((n) => (
                            <Link
                                key={n.id}
                                href={`/notes/${n.id}`}
                                className="flex flex-col rounded-lg border-2 border-dashed border-neutral-400 bg-white p-5 transition hover:border-neutral-600"
                            >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <h3 className="truncate text-sm font-semibold text-neutral-800">
                                        {n.title}
                                    </h3>
                                    <NoteTypeBadge type={n.note_type} />
                                </div>
                                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-neutral-500">
                                    {n.content}
                                </p>
                                <p className="mt-3 flex items-center gap-1 text-[11px] text-neutral-400">
                                    <Link2 className="h-3 w-3" />{" "}
                                    {outgoingLinks(n).length} links
                                </p>
                            </Link>
                        ))}
                    </div>

                    <NotesPagination
                        page={page}
                        pages={pages}
                        total={query.trim() ? filtered.length : total}
                        pageSize={pageSize}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    />
                </>
            )}


        </main>
    );
}
