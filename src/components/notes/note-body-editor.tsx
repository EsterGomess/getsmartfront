"use client";

import { useMemo, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";

interface NoteBodyEditorProps {
    value: string;
    onChange: (next: string) => void;
    notes: Note[];
    excludeId?: number;
    rows?: number;
    placeholder?: string;
}

const QUICK_LINK_LIMIT = 4;

/**
 * Textarea with inline note linking:
 * - Type "[[" to trigger an autocomplete of existing notes.
 * - Quick-link chips below show the N most recently created notes.
 *
 * Inserts `[[Note title]]` at the caret position.
 */
export function NoteBodyEditor({
                                   value,
                                   onChange,
                                   notes,
                                   excludeId,
                                   rows = 6,
                                   placeholder,
                               }: NoteBodyEditorProps) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [caret, setCaret] = useState(0);
    const [active, setActive] = useState(0);

    // All notes available for linking (exclude the current one).
    const available = useMemo(
        () => notes.filter((n) => n.id !== excludeId),
        [notes, excludeId],
    );

    // Quick-link chips: only the N most recently created notes.
    const recent = useMemo(
        () =>
            [...available]
                .sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                )
                .slice(0, QUICK_LINK_LIMIT),
        [available],
    );

    // Detect an unclosed "[[query" right before the caret.
    const trigger = useMemo(() => {
        const before = value.slice(0, caret);
        const start = before.lastIndexOf("[[");
        if (start === -1) return null;
        const fragment = before.slice(start + 2);
        if (fragment.includes("]]") || fragment.includes("\n")) return null;
        return { start, query: fragment };
    }, [value, caret]);

    // Notes that match the current query.
    const matches = useMemo(() => {
        if (!trigger) return [];
        const q = trigger.query.trim().toLowerCase();
        return available
            .filter((n) => (q ? n.title.toLowerCase().includes(q) : true))
            .slice(0, 6);
    }, [trigger, available]);

    function setCaretTo(pos: number) {
        requestAnimationFrame(() => {
            const el = ref.current;
            if (!el) return;
            el.focus();
            el.setSelectionRange(pos, pos);
            setCaret(pos);
        });
    }

    function complete(title: string) {
        if (!trigger) return;
        const after = value.slice(caret);
        const next = `${value.slice(0, trigger.start)}[[${title}]]${after}`;
        onChange(next);
        setActive(0);
        setCaretTo(trigger.start + title.length + 4);
    }

    function insertChip(title: string) {
        const el = ref.current;
        const pos = el ? el.selectionStart : value.length;
        const snippet = `[[${title}]]`;
        const needsSpace = pos > 0 && !/\s$/.test(value.slice(0, pos));
        const text = (needsSpace ? " " : "") + snippet;
        const next = value.slice(0, pos) + text + value.slice(pos);
        onChange(next);
        setCaretTo(pos + text.length);
    }

    const showMenu = !!trigger && matches.length > 0;

    return (
        <div>
            <div className="relative">
                <Textarea
                    ref={ref}
                    value={value}
                    rows={rows}
                    placeholder={
                        placeholder ?? 'Write the idea. Type "[[" to link another note.'
                    }
                    onChange={(e) => {
                        onChange(e.target.value);
                        setCaret(e.target.selectionStart);
                        setActive(0);
                    }}
                    onClick={(e) => setCaret(e.currentTarget.selectionStart)}
                    onKeyUp={(e) => setCaret(e.currentTarget.selectionStart)}
                    onKeyDown={(e) => {
                        if (!showMenu) return;
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setActive((a) => (a + 1) % matches.length);
                        } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActive((a) => (a - 1 + matches.length) % matches.length);
                        } else if (e.key === "Enter" || e.key === "Tab") {
                            e.preventDefault();
                            complete(matches[active].title);
                        } else if (e.key === "Escape") {
                            e.preventDefault();
                            setCaret(0);
                        }
                    }}
                    className="resize-none"
                />

                {showMenu && (
                    <ul className="absolute left-2 right-2 top-full z-10 -mt-1 max-h-44 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg">
                        {matches.map((n, i) => (
                            <li key={n.id}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => complete(n.title)}
                                    onMouseEnter={() => setActive(i)}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors",
                                        i === active
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent/50",
                                    )}
                                >
                                    <Link2 className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{n.title}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {recent.length > 0 && (
                <div className="mt-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Quick link a note
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                        {recent.map((n) => (
                            <Button
                                key={n.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => insertChip(n.title)}
                                className="h-6 max-w-48 truncate rounded-md px-2 text-[11px]"                            >
                                + {n.title}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}