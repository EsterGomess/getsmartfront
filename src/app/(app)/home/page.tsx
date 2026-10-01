// src/app/(app)/home/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    FolderPlus,
    FilePlus,
    Sparkles,
    Folder,
    Layers,
    Brain,
    StickyNote,
    ArrowRight,
} from "lucide-react";
import { fetchNotes } from "@/lib/notes";
import type { Note } from "@/lib/types";

export default function HomePage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchNotes({ page: 1, pageSize: 4 })
            .then((data) => {
                if (cancelled) return;
                setNotes(data.items);
                setTotal(data.total);
            })
            .catch(() => {
                // Silence error
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // ⚠️ Topics/flashcards/review not implemented yer
    // When endpoints create replace to real call.
    const topics: Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
        flashcards?: unknown[];
    }> = [];
    const due: Array<unknown> = [];
    const flashcardCount = 0;

    const stats = [
        { icon: Folder, label: "Topics", value: topics.length, href: "/topics" },
        { icon: Layers, label: "Flashcards", value: flashcardCount, href: "/flashcard" },
        { icon: Brain, label: "Due today", value: due.length, href:  "/review/flashcards" },
        { icon: StickyNote, label: "Notes", value: total, href: "/notes" },
    ];

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-neutral-800">Welcome back</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Here is a quick overview of your workspace.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s) => (
                    <Link
                        key={s.label}
                        href={s.href}
                        className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-5 transition hover:border-neutral-600"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-400 bg-neutral-100">
                                <s.icon className="h-4 w-4 text-neutral-600" />
                            </div>
                            <span className="text-xs uppercase tracking-wide text-neutral-500">
                {s.label}
              </span>
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-neutral-800">{s.value}</p>
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <div className="mb-8 flex flex-col gap-3 rounded-lg border-2 border-dashed border-neutral-500 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-neutral-400 bg-neutral-100">
                        <Sparkles className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-800">Today's review</h2>
                        <p className="mt-0.5 text-xs text-neutral-500">
                            {due.length === 0
                                ? "No cards to review today."
                                : `${due.length} ${due.length === 1 ? "card" : "cards"} to study today.`}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/notes/new"
                        className="inline-flex items-center gap-2 rounded border-2 border-dashed border-neutral-500 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                    >
                        <FilePlus className="h-4 w-4" />
                        New note
                    </Link>
                    <Link
                        href="/topics"
                        className="inline-flex items-center gap-2 rounded border-2 border-dashed border-neutral-500 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                    >
                        <FolderPlus className="h-4 w-4" />
                        New topic
                    </Link>
                    <Link
                        href="/topics/review"
                        className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium ${
                            due.length === 0
                                ? "cursor-not-allowed border border-dashed border-neutral-300 text-neutral-400"
                                : "bg-neutral-800 text-white hover:bg-neutral-700"
                        }`}
                        onClick={(e) => due.length === 0 && e.preventDefault()}
                    >
                        Start review
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Recent topics */}
            {topics.length > 0 && (
                <div className="mb-8">
                    <div className="mb-3 flex items-end justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                            Recent topics
                        </h2>
                        <Link href="/topics" className="text-xs text-neutral-500 underline">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {topics.slice(0, 4).map((t) => (
                            <Link
                                key={t.id}
                                href={`/topics/${t.id}`}
                                className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-4 transition hover:border-neutral-600"
                            >
                                <div
                                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded border border-neutral-400 text-lg ${t.color}`}
                                >
                                    {t.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-800">{t.name}</h3>
                                <p className="mt-1 text-xs text-neutral-400">
                                    {(t.flashcards?.length ?? 0)}{" "}
                                    {(t.flashcards?.length ?? 0) === 1 ? "card" : "cards"}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent notes */}
            <div>
                <div className="mb-3 flex items-end justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                        Recent notes
                    </h2>
                    <Link href="/notes" className="text-xs text-neutral-500 underline">
                        View all
                    </Link>
                </div>
                {loading ? (
                    <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-8 text-center">
                        <p className="text-sm text-neutral-500">Loading...</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-8 text-center">
                        <p className="text-sm text-neutral-500">
                            No notes yet. Write your first note to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {notes.map((n) => (
                            <Link
                                key={n.id}
                                href={`/notes/${n.id}`}
                                className="rounded-lg border-2 border-dashed border-neutral-400 bg-white p-4 transition hover:border-neutral-600"
                            >
                                <h3 className="text-sm font-semibold text-neutral-800">{n.title}</h3>
                                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-neutral-500">
                                    {n.content}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
