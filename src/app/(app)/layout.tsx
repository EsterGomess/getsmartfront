// src/app/(app)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserToken } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

export default function AppLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        if (!getUserToken()) {
            router.replace("/login");
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time auth gate
        setAuthed(true);
    }, [router]);

    // Prevent a flash of the authenticated UI while the check runs.
    if (!authed) {
        return <div className="min-h-screen bg-neutral-100" />;
    }

    return (
        <div className="flex min-h-screen flex-col bg-neutral-100 font-mono text-neutral-700">
            <AppHeader />
            <div className="flex flex-1 flex-col">{children}</div>
            <AppFooter />
        </div>
    );
}