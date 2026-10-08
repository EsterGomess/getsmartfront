// src/lib/topics-store.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";
import { buildAuthContext, withAuthGuard } from "./api-auth";
import { usePaginatedList } from "./use-paginated-list";
import { useResource } from "./use-resource";
import type {
    Topic,
    TopicCreatePayload,
    TopicUpdatePayload,
} from "./types";

// ─── Types ─────────────────────────────────────────────────

export interface UseTopicsOptions {
    page?: number;
    pageSize?: number;
}

// ─── Hooks ─────────────────────────────────────────────────

export function useTopics(options?: UseTopicsOptions) {
    const { items, ...rest } = usePaginatedList<Topic>(
        "/topics/",
        options,
        "Failed to load topics",
    );
    return { topics: items, ...rest };
}

export function useTopic(id: number) {
    const { item, ...rest } = useResource<Topic>(
        "/topics",
        id,
        "Failed to load topic",
    );
    return { topic: item, ...rest };
}

export function useCreateTopic() {
    const router = useRouter();
    return useCallback(
        async (input: TopicCreatePayload) => {
            const topic = await createTopic(input);
            router.push(`/topics/${topic.id}`);
            return topic;
        },
        [router],
    );
}

// ─── Mutations ─────────────────────────────────────────────

export async function createTopic(input: TopicCreatePayload): Promise<Topic> {
    const title = input.title?.trim();
    const description = input.description?.trim();

    if (!title || title.length < 1) {
        throw new ApiError(400, "Title is required");
    }

    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        return api<Topic>("/topics/", {
            method: "POST",
            body: { ...input, title, description },
            userToken: ctx.userToken,
        });
    });
}

export async function updateTopic(
    id: number,
    patch: TopicUpdatePayload,
): Promise<Topic> {
    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        return api<Topic>(`/topics/${id}`, {
            method: "PATCH",
            body: patch,
            userToken: ctx.userToken,
        });
    });
}

export async function deleteTopic(id: number): Promise<void> {
    return withAuthGuard(async () => {
        const ctx = buildAuthContext();
        await api<void>(`/topics/?topic_id=${id}`, {
            method: "DELETE",
            userToken: ctx.userToken,
        });
    });
}