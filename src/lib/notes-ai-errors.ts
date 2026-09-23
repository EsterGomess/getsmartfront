// src/lib/notes-ai-errors.ts

/**
 * `"use server"` can only export async functions — classes are not allowed.
 * The client imports this class directly to do `instanceof` checks.
 */
export type NotesAiErrorCode =
    | "MISSING_API_KEY"
    | "INVALID_INPUT"
    | "TIMEOUT"
    | "RATE_LIMITED"
    | "UPSTREAM_ERROR"
    | "UNKNOWN";

export class NotesAiError extends Error {
    public readonly code: NotesAiErrorCode;
    public readonly cause?: unknown;

    constructor(
        message: string,
        code: NotesAiErrorCode,
        cause?: unknown,
    ) {
        super(message);
        this.name = "NotesAiError";
        this.code = code;
        this.cause = cause;

        // Restore the prototype chain when targeting ES5.
        // Harmless (and a no-op) on ES2015+ targets, which is what Next.js uses.
        Object.setPrototypeOf(this, NotesAiError.prototype);
    }

    /** True if the error is worth retrying with a short backoff. */
    get isRetriable(): boolean {
        return this.code === "RATE_LIMITED" || this.code === "UPSTREAM_ERROR";
    }
}