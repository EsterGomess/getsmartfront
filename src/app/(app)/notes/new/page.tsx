"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserToken } from "@/lib/auth";

export default function NewNotePage() {
    const router = useRouter();

    useEffect(() => {
        if (!getUserToken()) router.replace("/login");
    }, [router]);

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 space-y-4">
            <h2 className="text-lg font-semibold">New note</h2>
            <p className="text-sm text-muted-foreground">
                Form coming soon.
            </p>
        </main>
    );
}
