// src/lib/notes-ai.ts
"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { NotesAiError } from "./notes-ai-errors";

// ─── Configuration ─────────────────────────────────────────

const MODEL = "gpt-4o-mini";
const MAX_CANDIDATES = 40;
const MAX_SUGGESTIONS = 5;
const MAX_OUTPUT_TOKENS = 500;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;
const MIN_BODY_LENGTH = 10;

// ─── Schemas ───────────────────────────────────────────────

const SuggestInputSchema = z.object({
    title: z.string().max(255, "Title is too long"),
    body: z
        .string()
        .min(MIN_BODY_LENGTH, `Body must be at least ${MIN_BODY_LENGTH} characters`)
        .max(20_000, "Body is too long"),
    candidates: z
        .array(
            z.object({
                title: z.string().min(1).max(255),
                excerpt: z.string().max(500),
            }),
        )
        .max(MAX_CANDIDATES, `At most ${MAX_CANDIDATES} candidates allowed`),
});

const SuggestionSchema = z.object({
    connections: z
        .array(
            z.object({
                title: z.string().min(1),
                reason: z.string().min(1).max(300),
            }),
        )
        .max(MAX_SUGGESTIONS),
});

export type Suggestions = z.infer<typeof SuggestionSchema>;
export type SuggestInput = z.input<typeof SuggestInputSchema>;

// ─── Logger ────────────────────────────────────────────────

function log(
    level: "info" | "warn" | "error",
    message: string,
    context: Record<string, unknown> = {},
) {
    const line = JSON.stringify({
        level,
        scope: "notes-ai",
        message,
        ts: new Date().toISOString(),
        ...context,
    });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
}

// ─── OpenAI client (lazy, validated) ───────────────────────

let cachedClient: ReturnType<typeof createOpenAI> | null = null;

function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new NotesAiError("OPENAI_API_KEY is not set", "MISSING_API_KEY");
    }
    if (!cachedClient) {
        cachedClient = createOpenAI({ apiKey });
    }
    return cachedClient;
}

// ─── Helpers ───────────────────────────────────────────────

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(thenable: PromiseLike<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new NotesAiError("Request timed out", "TIMEOUT")),
            ms,
        );
        Promise.resolve(thenable).then(
            (v) => {
                clearTimeout(timer);
                resolve(v);
            },
            (e) => {
                clearTimeout(timer);
                reject(e);
            },
        );
    });
}

/**
 * Safely extracts an HTTP status code from an unknown error value.
 * Works for errors thrown by the OpenAI SDK (which expose a `status` prop).
 */
function getErrorStatus(err: unknown): number | undefined {
    if (typeof err !== "object" || err === null) return undefined;
    if (!("status" in err)) return undefined;
    const status = (err as { status: unknown }).status;
    return typeof status === "number" ? status : undefined;
}

/**
 * Safely extracts a message from an unknown error value.
 */
function getErrorMessage(err: unknown): string | undefined {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (typeof err === "object" && err !== null && "message" in err) {
        const msg = (err as { message: unknown }).message;
        return typeof msg === "string" ? msg : undefined;
    }
    return undefined;
}

function isRetriable(err: unknown): boolean {
    if (err instanceof NotesAiError) return false;
    const status = getErrorStatus(err);
    if (status === 429 || status === 500 || status === 502 || status === 503) {
        return true;
    }
    const code = (err as { code?: unknown } | undefined)?.code;
    if (typeof code === "string" && code.startsWith("ETIMEDOUT")) {
        return true;
    }
    return false;
}

function buildPrompt(data: z.infer<typeof SuggestInputSchema>): string {
    const candidateList = data.candidates
        .map((c, i) => `${i + 1}. ${c.title}\n   ${c.excerpt}`)
        .join("\n");

    return [
        "You help maintain a Zettelkasten note box.",
        "",
        "Task: given a NEW note, suggest which EXISTING notes it should link to.",
        "",
        "Rules (strict):",
        "1. Only suggest notes whose title appears EXACTLY in the existing notes list.",
        "2. Do not invent titles. Do not paraphrase titles.",
        `3. Suggest at most ${MAX_SUGGESTIONS} connections.`,
        "4. Each reason must be ONE short sentence (max 20 words).",
        "5. Prefer conceptual overlap over keyword matching.",
        "6. If nothing is related, return an empty array.",
        "",
        "Output format:",
        '{ "connections": [ { "title": "<exact title>", "reason": "<one sentence>" } ] }',
        "",
        "---",
        `NEW NOTE TITLE: ${data.title || "(untitled)"}`,
        "",
        "NEW NOTE BODY:",
        data.body,
        "",
        "EXISTING NOTES:",
        candidateList || "(none)",
    ].join("\n");
}

// ─── Core call (single attempt) ────────────────────────────

async function attemptSuggest(
    prompt: string,
    knownTitles: Set<string>,
): Promise<Suggestions> {
    const openai = getOpenAIClient();

    const result = streamText({
        model: openai(MODEL),
        output: Output.object({ schema: SuggestionSchema }),
        prompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.2,
    });

    const output = await withTimeout(result.output, REQUEST_TIMEOUT_MS);

    // Filter out hallucinations and cap at MAX_SUGGESTIONS.
    const filtered = (output.connections ?? [])
        .map((c) => ({
            title: c.title.trim(),
            reason: c.reason.trim(),
        }))
        .filter((c) => knownTitles.has(c.title.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS);

    // De-duplicate by title (case-insensitive).
    const seen = new Set<string>();
    const deduped = filtered.filter((c) => {
        const key = c.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return { connections: deduped };
}

// ─── Public Server Action ──────────────────────────────────

export async function suggestConnections(
    input: SuggestInput,
): Promise<Suggestions> {
    // 1. Validate input — reject early, before hitting the API.
    const parsed = SuggestInputSchema.safeParse(input);
    if (!parsed.success) {
        log("warn", "invalid_input", {
            issues: parsed.error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            })),
        });
        throw new NotesAiError(
            parsed.error.issues[0]?.message ?? "Invalid input",
            "INVALID_INPUT",
            parsed.error,
        );
    }

    const data = parsed.data;
    const knownTitles = new Set(
        data.candidates.map((c) => c.title.trim().toLowerCase()),
    );

    // 2. If there are no candidates, skip the API call entirely.
    if (data.candidates.length === 0) {
        log("info", "skipped_no_candidates", { titleLength: data.title.length });
        return { connections: [] };
    }

    const prompt = buildPrompt(data);
    const startedAt = Date.now();

    // 3. Retry loop for transient failures.
    let lastError: unknown = undefined;
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            const result = await attemptSuggest(prompt, knownTitles);
            log("info", "suggest_ok", {
                attempt,
                durationMs: Date.now() - startedAt,
                candidates: data.candidates.length,
                connections: result.connections.length,
            });
            return result;
        } catch (err) {
            lastError = err;

            // No valid JSON from the model → return empty, don't retry.
            if (NoObjectGeneratedError.isInstance(err)) {
                log("warn", "no_object_generated", {
                    attempt,
                    durationMs: Date.now() - startedAt,
                });
                return { connections: [] };
            }

            // Timeout or non-retriable error → bail immediately.
            if (!isRetriable(err) || attempt > MAX_RETRIES) {
                break;
            }

            log("warn", "retrying", {
                attempt,
                nextDelayMs: RETRY_DELAY_MS * attempt,
            });
            await sleep(RETRY_DELAY_MS * attempt);
        }
    }

    // 4. Categorize the final error for the caller.
    if (lastError instanceof NotesAiError) {
        log("error", "suggest_failed", {
            code: lastError.code,
            message: lastError.message,
            durationMs: Date.now() - startedAt,
        });
        throw lastError;
    }

    const status = getErrorStatus(lastError);
    if (status === 429) {
        log("error", "rate_limited", { durationMs: Date.now() - startedAt });
        throw new NotesAiError("Rate limited by OpenAI", "RATE_LIMITED", lastError);
    }

    log("error", "upstream_error", {
        message: getErrorMessage(lastError),
        durationMs: Date.now() - startedAt,
    });
    throw new NotesAiError(
        "AI provider returned an error",
        "UPSTREAM_ERROR",
        lastError,
    );
}