"use client";

import { useState } from "react";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { suggestNoteConnections } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SuggestionsResponse } from "@/lib/types";

interface SuggestConnectionsProps {
    title: string;
    content: string;
    onInsertLink: (noteTitle: string) => void;
}

export function SuggestConnections({
                                       title,
                                       content,
                                       onInsertLink,
                                   }: SuggestConnectionsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SuggestionsResponse | null>(null);

    async function run() {
        setLoading(true);
        setError(null);
        try {
            const data = await suggestNoteConnections({
                title: title.trim(),
                content: content.trim(),
            });
            setResult(data);
        } catch {
            setError("Could not get suggestions right now. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const canSuggest =
        title.trim().length >= 1 &&
        title.trim().length <= 255 &&
        content.trim().length >= 10 &&
        content.trim().length <= 20_000;

    return (
        <div className="rounded-lg border border-dashed p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" /> AI suggestions
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        Find related notes from your note text.
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    onClick={run}
                    disabled={loading || !canSuggest}
                    className="shrink-0"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Thinking
                        </>
                    ) : (
                        "Suggest"
                    )}
                </Button>
            </div>

            {!canSuggest && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                    Write a bit more text to get suggestions.
                </p>
            )}

            {error && (
                <Alert variant="destructive" className="mt-3">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}

            {result && !loading && (
                <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Related notes
                    </p>
                    {result.connections.length === 0 ? (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            No suggestions
                        </p>
                    ) : (
                        <ul className="mt-2 space-y-2">
                            {result.connections.map((c) => (
                                <li
                                    key={c.title}
                                    className="flex items-start justify-between gap-3"
                                >
                  <span className="text-xs">
                    <span className="font-semibold text-foreground">
                      {c.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {c.reason}
                    </span>
                  </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onInsertLink(c.title)}
                                        className="h-6 shrink-0 px-2 text-[11px]"
                                    >
                                        <Plus className="h-3 w-3" /> Link
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
