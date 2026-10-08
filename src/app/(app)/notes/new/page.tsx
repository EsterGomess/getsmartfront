// src/app/(app)/notes/new/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCreateNote, useNotes } from "@/lib/notes/notes-store";
import { getUserToken } from "@/lib/auth";
import { NoteForm } from "@/components/notes/note-form";
import { PageShell } from "@/components/page-shell";

export default function NewNotePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Veio de `/topics/{id}`? Então essa nota pertence ao tópico.
    const topicIdParam = searchParams.get("topic_id");
    const topicId = topicIdParam ? Number(topicIdParam) : null;
    const validTopicId =
        topicId !== null && Number.isFinite(topicId) && topicId > 0
            ? topicId
            : null;

    const { notes } = useNotes({ pageSize: 50 });
    const create = useCreateNote();

    useEffect(() => {
        if (!getUserToken()) router.replace("/login");
    }, [router]);

    const backHref = validTopicId ? `/topics/${validTopicId}` : "/notes";
    const backLabel = validTopicId ? "Back to topic" : "Back to notes";

    return (
        <PageShell maxWidth="max-w-2xl">
            <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                {backLabel}
            </Link>

            <div className="mt-4 rounded-lg border-2 border-dashed border-neutral-500 bg-white p-6">
                <h1 className="text-lg font-semibold text-neutral-800">
                    New note
                </h1>
                <p className="mt-1 text-xs text-neutral-500">
                    Keep it atomic: one idea per note.
                </p>

                <div className="mt-5">
                    <NoteForm
                        notes={notes}
                        autoFocusTitle
                        hideCancel
                        submitLabel="Create"
                        onCancel={() => router.push(backHref)}
                        onCreate={(input) =>
                            create({ ...input, topic_id: validTopicId })
                        }
                    />
                </div>
            </div>
        </PageShell>
    );
}