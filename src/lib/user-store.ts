// src/lib/user-store.ts
import { useSyncExternalStore } from "react";
import { api, ApiError } from "@/lib/api";
import { getUserToken, clearTokens } from "./auth";
import type { User } from "./types";

export type Profile = {
    email: string;
};

const STORAGE_KEY = "wf.profile.v1";
const DEFAULT_PROFILE: Profile = { email: "user@example.com" };

const listeners = new Set<() => void>();
let profile: Profile = load();

function load(): Profile {
    if (typeof window === "undefined") return DEFAULT_PROFILE;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PROFILE;
        const parsed = JSON.parse(raw) as Profile;
        if (parsed && typeof parsed.email === "string") return parsed;
        return DEFAULT_PROFILE;
    } catch {
        return DEFAULT_PROFILE;
    }
}

function persist() {
    if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useProfile(): Profile {
    return useSyncExternalStore(
        subscribe,
        () => profile,
        () => DEFAULT_PROFILE,
    );
}

export async function updateEmail(newEmail: string): Promise<void> {
    const userToken = getUserToken();
    if (!userToken) {
        throw new ApiError(401, "Not authenticated");
    }

    try {
        const user = await api<User>("/customers/me/email", {
            method: "PATCH",
            body: { new_email: newEmail },
            userToken,
        });

        // Sincronize profile
        profile = { ...profile, email: user.email ?? newEmail };
        persist();
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            clearTokens();
        }
        throw err;
    }
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
