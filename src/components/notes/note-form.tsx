// src/components/notes/note-form.tsx
"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import type { Note, NoteType } from "@/lib/types";
import type { CreateNoteInput } from "@/lib/notes/notes-store";
import { NoteBodyEditor } from "@/components/notes/note-body-editor";
import { SuggestConnections } from "@/components/notes/suggest-connections";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
    TYPES,
    DEFAULT_NOTE_TYPE,
    inputCls,
    labelCls,
    TitleField,
} from "@/components/notes/note-ui";

export interface NoteFormProps {
    notes: Note[];
    /** Called with the validated payload. Must throw on failure. */
    onCreate: (input: CreateNoteInput) => Promise<unknown>;
    onCancel: () => void;
    autoFocusTitle?: boolean;
    hideCancel?: boolean;
    submitLabel?: string;
}

export function NoteForm({
                             notes,
                             onCreate,
                             onCancel,
                             autoFocusTitle = true,
                             hideCancel = false,
                             submitLabel = "Create",
                         }: NoteFormProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [source, setSource] = useState("");
    const [noteType, setNoteType] = useState<NoteType>(DEFAULT_NOTE_TYPE);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = title.trim() && content.trim() && !saving;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();
        const trimmedSource = source.trim();

        if (!trimmedTitle) return setError("Title is required");
        if (!trimmedContent) return setError("Content is required");

        // Source is free-form text, only limited by the backend column size.
        if (trimmedSource.length > 255) {
            return setError("Source is too long (max 255 characters)");
        }

        const payload: CreateNoteInput = {
            title: trimmedTitle,
            content: trimmedContent,
            note_type: noteType,
        };
        if (trimmedSource) payload.source = trimmedSource;

        setSaving(true);
        try {
            await onCreate(payload);
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.detail
                    : "Could not create note. Try again.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <TitleField
                value={title}
                onChange={setTitle}
                autoFocus={autoFocusTitle}
            />

            <div>
                <label className={labelCls}>Note</label>
                <NoteBodyEditor
                    value={content}
                    onChange={setContent}
                    notes={notes}
                    rows={6}
                />
            </div>

            <div>
                <label htmlFor="source" className={labelCls}>
                    Source{" "}
                    <span className="normal-case text-neutral-400">(optional)</span>
                </label>
                <input
                    id="source"
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Book, article, person, URL…"
                    maxLength={255}
                    disabled={saving}
                    className={`${inputCls} disabled:opacity-60`}
                />
                <p className="mt-1 text-[10px] text-neutral-400">
                    Where this idea came from — anything you like.
                </p>
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

            <SuggestConnections
                title={title}
                content={content}
                onInsertLink={(t) =>
                    setContent((b) =>
                        b.trimEnd()
                            ? `${b.trimEnd()}\n\nSee also [[${t}]].`
                            : `See also [[${t}]].`,
                    )
                }
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
                {!hideCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? "Creating..." : submitLabel}
                </button>
            </div>
        </form>
    );
}