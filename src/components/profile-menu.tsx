"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Mail, X } from "lucide-react";
import { isValidEmail, updateEmail, useProfile } from "@/lib/user-store";
import { ApiError } from "@/lib/api";

export function ProfileMenu() {
    const profile = useProfile();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    if (!profile) {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-200 text-[10px] font-semibold text-neutral-500">
                --
            </div>
        );
    }

    const initials = profile.email.slice(0, 2).toUpperCase();

    function handleSignOut() {
        setOpen(false);
        router.push("/login");

    }

    return (
        <div className="relative" ref={wrapRef}>
            <button
                type="button"
                aria-label="Profile menu"
                onClick={() => setOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-neutral-200 text-[10px] font-semibold text-neutral-700 transition hover:bg-neutral-300"
            >
                {initials}
            </button>

            {open && (
                <div className="absolute right-0 z-20 mt-2 w-60 rounded-lg border-2 border-dashed border-neutral-400 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-dashed border-neutral-300 pb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100 text-[10px] font-semibold">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide text-neutral-500">
                                Signed in as
                            </p>
                            <p className="truncate text-xs text-neutral-800">{profile.email}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditing(true);
                            setOpen(false);
                        }}
                        className="mt-2 flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs text-neutral-700 transition hover:bg-neutral-100"
                    >
                        <Mail className="h-3.5 w-3.5" />
                        Edit email
                    </button>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs text-neutral-700 transition hover:bg-neutral-100"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                    </button>
                </div>
            )}

            {editing && (
                <EditEmailDialog
                    current={profile.email}
                    onClose={() => setEditing(false)}
                    onSave={async (email) => {

                        await updateEmail(email);
                        setEditing(false);
                    }}
                />
            )}
        </div>
    );
}

function EditEmailDialog({
                             current,
                             onClose,
                             onSave,
                         }: {
    current: string;
    onClose: () => void;
    onSave: (email: string) => Promise<void>;
}) {
    const [email, setEmail] = useState(current);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const trimmed = email.trim().toLowerCase();
        if (!isValidEmail(trimmed)) {
            setError("Enter a valid email address.");
            return;
        }
        if (trimmed === current.toLowerCase()) {
            setError("New email must be different from the current one.");
            return;
        }

        setSaving(true);
        try {
            await onSave(trimmed);
        } catch (err) {
            if (err instanceof ApiError) setError(err.detail);
            else setError("Unexpected error. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 p-4">
            <div className="w-full max-w-sm rounded-lg border-2 border-dashed border-neutral-400 bg-white p-6 font-mono shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-500" />
                        <h2 className="text-sm font-semibold text-neutral-800">Edit email</h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={saving}
                        className="text-neutral-400 transition hover:text-neutral-700 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            autoFocus
                            disabled={saving}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(null);
                            }}
                            placeholder="you@example.com"
                            className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500 disabled:opacity-60"
                        />
                        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded bg-neutral-800 py-2 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 rounded border border-neutral-300 py-2 text-xs text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
