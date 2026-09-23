// src/app/(auth)/layout.tsx
import { AppFooter } from "@/components/layout/app-footer";
import { AppLogo } from "@/components/layout/app-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-100 font-mono text-neutral-700">
            {/* Header — shared by all auth pages */}
            <header className="border-b border-dashed border-neutral-400 bg-white/60">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <AppLogo size={32} className="h-8 w-8 border border-neutral-400" priority />
                        <span className="text-sm font-semibold text-neutral-800">
                            GieokGonggan
                        </span>
                    </div>
                </div>
            </header>

            {/* Main — children renders the current page */}
            <main className="flex flex-1 items-center justify-center px-6 py-12">
                {children}
            </main>

            {/* Footer — shared by all auth pages */}
            <AppFooter />
        </div>
    );
}
