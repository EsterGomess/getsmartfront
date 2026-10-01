// src/app/(auth)/login/page.tsx
"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { AppLogo } from "@/components/layout/app-logo";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const justRegistered = searchParams.get("registered") === "1";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await loginUser({ username: username.trim(), password });
            router.replace("/notes");
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setError("Invalid username or password");
            } else {
                setError("Unexpected error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md rounded-lg border-2 border-dashed border-neutral-400 bg-white p-8 shadow-sm">
            <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100 p-2">
                    <AppLogo size={36} className="h-full w-full" priority />
                </div>
            </div>

            <h1 className="text-center text-2xl font-semibold text-neutral-800">
                Welcome back
            </h1>
            <p className="mt-1 text-center text-sm text-neutral-500">
                Sign in to your account
            </p>

            {justRegistered && (
                <p className="mt-4 text-center text-xs text-emerald-600">
                    Account created. Please sign in.
                </p>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor="username"
                        className="mb-1 block text-xs uppercase tracking-wide text-neutral-500"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your_username"
                        required
                        autoComplete="username"
                        className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-xs uppercase tracking-wide text-neutral-500"
                        >
                            Password
                        </label>
                        <a href="/forgot-password" className="text-xs text-neutral-500 underline">
                            Forgot password?
                        </a>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 pr-10 text-sm outline-none focus:border-neutral-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-neutral-800 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-neutral-800 underline">
                    Sign up
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-100" />}>
            <LoginForm />
        </Suspense>
    );
}
