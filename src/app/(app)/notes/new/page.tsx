// src/app/(app)/notes/new/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCreateNote, useNotes } from "@/lib/notes-store";
import { getUserToken } from "@/lib/auth";
import { NoteForm } from "@/components/notes/note-form";

export default function NewNotePage() {
    const router = useRouter();
    const { notes } = useNotes({ pageSize: 50 });
    const create = useCreateNote();

    useEffect(() => {
        if (!getUserToken()) router.replace("/login");
    }, [router]);

    return (
        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
            <Link
                href="/notes"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to notes
            </Link>

            <div className="mt-4 rounded-lg border-2 border-dashed border-neutral-500 bg-white p-6">
                <h1 className="text-lg font-semibold text-neutral-800">New note</h1>
                <p className="mt-1 text-xs text-neutral-500">
                    Keep it atomic: one idea per note.
                </p>

                <div className="mt-5">
                    <NoteForm
                        notes={notes}
                        autoFocusTitle
                        hideCancel
                        submitLabel="Create"
                        onCancel={() => router.push("/notes")}
                        onCreate={create}
                    />
                </div>
            </div>
        </main>
    );
}