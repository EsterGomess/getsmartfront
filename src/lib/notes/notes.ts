// src/lib/notes.ts
import { api, ApiError } from "../api";
import { getUserToken, clearTokens } from "../auth";
import type { NotesPageResponse, SuggestConnectionsRequest, SuggestionsResponse } from "../types";

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

    const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
    });

    try {
        return await api<NotesPageResponse>(`/notes/list?${params.toString()}`, {
            method: "GET",
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

export async function suggestNoteConnections(
    payload: SuggestConnectionsRequest,
): Promise<SuggestionsResponse> {
    const userToken = getUserToken();
    if (!userToken) throw new ApiError(401, "Not authenticated");

    try {
        return await api<SuggestionsResponse>("/notes/suggest-connections", {
            method: "POST",
            body: payload,
            userToken,
        });
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) clearTokens();
        throw err;
    }
}
