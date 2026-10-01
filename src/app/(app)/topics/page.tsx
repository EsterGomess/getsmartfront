// src/app/(app)/topics/page.tsx
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

export default function TopicsPage() {
    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
            <Link
                href="/home"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
            </Link>

            <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-400 bg-white p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100">
                    <Construction className="h-7 w-7 text-neutral-500" />
                </div>
                <h1 className="text-2xl font-semibold text-neutral-800">
                    In development
                </h1>
                    The page of topics is under development.
                    Soon you will be able to organize your notes in topics and flashcards here.
                <p className="mt-2 max-w-md text-sm text-neutral-500">
                </p>
                <Link
                    href="/home"
                    className="mt-6 inline-flex items-center gap-2 rounded border-2 border-dashed border-neutral-500 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                    Go to home
                </Link>
            </div>
        </main>
    );
}