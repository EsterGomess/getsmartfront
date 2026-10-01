"use client";

import {use, useState, FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Eye, EyeOff} from "lucide-react";
import {resetPassword} from "@/lib/auth";
import {ApiError} from "@/lib/api";
import {AppLogo} from "@/components/layout/app-logo";

interface ResetPasswordPageProps {
    params: Promise<{
        token: string;
    }>;
}

export default function ResetPasswordPage({
                                              params,
                                          }: ResetPasswordPageProps) {
    const router = useRouter();

    const {token} = use(params);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
                token,
                new_password: password,
                confirm_password: confirmPassword,
            });

            router.push("/customers");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
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
                    <AppLogo
                        size={36}
                        className="h-full w-full"
                        priority
                    />
                </div>
            </div>

            <h1 className="text-center text-xl font-semibold text-neutral-800">
                Reset password
            </h1>

            <p className="mt-2 text-center text-sm text-neutral-500">
                Enter your new password below.
            </p>

            <form
                className="mt-8 space-y-4"
                onSubmit={handleSubmit}
            >
                <div>
                    <label
                        htmlFor="password"
                        className="mb-1 block text-xs uppercase tracking-wide text-neutral-500"
                    >
                        Password
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 pr-10 text-sm outline-none focus:border-neutral-500"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((value) => !value)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="mb-1 block text-xs uppercase tracking-wide text-neutral-500"
                    >
                        Confirm password
                    </label>

                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        placeholder="••••••••"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                    />
                </div>

                {error && (
                    <p
                        className="text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-neutral-800 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
                >
                    {loading
                        ? "Updating password..."
                        : "Reset password"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-neutral-800 underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}