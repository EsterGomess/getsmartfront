// src/components/notes/note-ui.tsx
import type { NoteType } from "@/lib/types";

// ─── Constants ─────────────────────────────────────────────

export const TYPES: { value: NoteType; label: string; hint: string }[] = [
    { value: "PERMANENT", label: "Permanent", hint: "evergreen" },
    { value: "FLEETING", label: "Fleeting", hint: "quick" },
    { value: "LITERATURE", label: "Literature", hint: "source" },
];

export const DEFAULT_NOTE_TYPE: NoteType = "PERMANENT";

const BADGE: Record<NoteType, { label: string; cls: string }> = {
    PERMANENT: { label: "Permanent", cls: "border-emerald-300 bg-emerald-50 text-emerald-700" },
    FLEETING: { label: "Fleeting", cls: "border-amber-300 bg-amber-50 text-amber-700" },
    LITERATURE: { label: "Literature", cls: "border-sky-300 bg-sky-50 text-sky-700" },
};

// ─── Shared class strings ──────────────────────────────────

export const inputCls =
    "w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500";

export const labelCls =
    "mb-1 block text-xs uppercase tracking-wide text-neutral-500";

// ─── Components ────────────────────────────────────────────

export function StateBox({
                             children,
                             tone = "muted",
                         }: {
    children: React.ReactNode;
    tone?: "muted" | "error";
}) {
    const cls =
        tone === "error"
            ? "border-red-400 text-red-600"
            : "border-neutral-400 text-neutral-500";
    return (
        <div className={`rounded-lg border-2 border-dashed bg-white p-12 text-center text-sm ${cls}`}>
            {children}
        </div>
    );
}

export function NoteTypeBadge({ type }: { type: NoteType }) {
    const { label, cls } = BADGE[type];
    return (
        <span
            className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${cls}`}
        >
      {label}
    </span>
    );
}

export function TitleField({
                               value,
                               onChange,
                               autoFocus,
                           }: {
    value: string;
    onChange: (v: string) => void;
    autoFocus?: boolean;
}) {
    return (
        <div>
            <label className={labelCls}>Title</label>
            <input
                autoFocus={autoFocus}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Spaced repetition beats cramming"
                className={inputCls}
            />
            <p className="mt-1 text-[10px] text-neutral-400">
                One idea, stated as a claim — not a topic.
            </p>
        </div>
    );
}