"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Network } from "lucide-react";
import { logout } from "@/lib/auth";
import { AppLogo } from "@/components/layout/app-logo";

interface AppHeaderProps {
    children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
    const router = useRouter();

    function handleLogout() {
        logout();
        router.replace("/login");
    }

    return (
        <header className="border-b border-dashed border-neutral-400 bg-white/60">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/notes" className="flex items-center gap-2">
                        <AppLogo size={32} className="h-8 w-8 border border-neutral-400" priority />
                        <span className="text-sm font-semibold text-neutral-800">
              Ideiateca
            </span>
                    </Link>

                    <nav className="flex items-center gap-3">
                        <Link
                            href="/notes"
                            className="text-xs text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
                        >
                            Notes
                        </Link>
                        <Link
                            href="/graph"
                            className="inline-flex items-center gap-1 text-xs text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
                        >
                            <Network className="h-3 w-3" />
                            Graph
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {children}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                    </button>
                </div>
            </div>
        </header>
    );
}
