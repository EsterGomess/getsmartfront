"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { AppLogo } from "@/components/layout/app-logo";
import {
    forgotPasswordSchema,
    type ForgotPasswordValues,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: ForgotPasswordValues) {
        setError(null);
        try {
            await forgotPassword({ email: values.email });
            setSent(true);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.detail ?? "Could not send the reset link.");
            } else {
                setError("Unexpected error. Please try again.");
            }
        }
    }

    return (
        <div className="w-full max-w-md rounded-lg border-2 border-dashed border-neutral-400 bg-white p-8 shadow-sm">
            <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100 p-2">
                    <AppLogo size={36} className="h-full w-full" priority />
                </div>
            </div>

            {sent ? (
                <>
                    <h1 className="text-center text-xl font-semibold">Check your inbox</h1>
                    <p className="mt-2 text-center text-sm text-neutral-500">
                        If the email is registered, you will receive a reset link shortly.
                    </p>
                    <p className="mt-6 text-center text-sm text-neutral-500">
                        <Link href="/login" className="font-medium text-neutral-800 underline">
                            Back to sign in
                        </Link>
                    </p>
                </>
            ) : (
                <>
                    <h1 className="text-center text-xl font-semibold">Forgot password</h1>
                    <p className="mt-2 text-center text-sm text-neutral-500">
                        Enter your email and we will send you a reset link.
                    </p>

                    <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1 block text-xs uppercase tracking-wide text-neutral-500"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...form.register("email")}
                                className="w-full rounded border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                            />
                            {form.formState.errors.email && (
                                <p className="mt-1 text-xs text-red-600" role="alert">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-sm text-red-600" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="w-full rounded bg-neutral-800 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
                        >
                            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-neutral-500">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-neutral-800 underline">
                            Sign in
                        </Link>
                    </p>
                </>
            )}
        </div>
    );
}