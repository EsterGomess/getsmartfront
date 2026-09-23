// src/lib/notes.ts
import { api, ApiError } from "./api";
import { authenticateApiClient, getUserToken, clearTokens } from "./auth";
import type { NotesPageResponse } from "./types";

interface FetchNotesParams {
    page?: number;
    pageSize?: number;
}

export async function fetchNotes({
                                     page = 1,
                                     pageSize = 20,
                                 }: FetchNotesParams = {}): Promise<NotesPageResponse> {
    const userToken = getUserToken();
    if (!userToken) {
        throw new ApiError(401, "Not authenticated");
    }

    const apiClientToken = await authenticateApiClient();

    const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
    });

    try {
        return await api<NotesPageResponse>(`/notes/list?${params.toString()}`, {
            method: "GET",
            apiClientToken,
            userToken,
        });
    } catch (err) {
        // If either token is stale, clear everything and let the page redirect.
        if (err instanceof ApiError && err.status === 401) {
            clearTokens();
        }
        throw err;
    }
}