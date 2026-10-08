// components/page-shell.tsx
"use client";

export interface PageShellProps {
    children: React.ReactNode;
    /** Tailwind max-width class. Defaults to `max-w-5xl` (list pages). */
    maxWidth?: string;
}

/**
 * The `<main>` wrapper that every `(app)` page uses. Header/nav live in
 * `app/(app)/layout.tsx`, so this is only the content column.
 */
export function PageShell({
                              children,
                              maxWidth = "max-w-5xl",
                          }: PageShellProps) {
    return (
        <main className={`mx-auto w-full ${maxWidth} flex-1 px-6 py-10`}>
            {children}
        </main>
    );
}