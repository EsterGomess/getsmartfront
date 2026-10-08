// src/lib/types.ts

// ─── Enums ──────────────────────────────────────────────────
export type NoteType = "FLEETING" | "LITERATURE" | "PERMANENT";

// ─── Auth: payloads ─────────────────────────────────────────
export interface UserLoginPayload {
    username: string;
    password: string;
}

export interface UserCreatePayload {
    username: string;
    email: string;
    password: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    new_password: string;
    confirm_password: string;
}

export interface UpdateUserEmailPayload {
    new_email: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

// ─── Auth: responses ────────────────────────────────────────
// Matches backend UserReadSchema
export interface User {
    id: number;
    username: string;
    email: string | null;
    is_active: boolean;
    created_at: string;
}

// Matches backend UserLoginResponseSchema
export interface UserLoginResponse {
    username: string;
    access_token: string;
    token_type: string;
}

// Matches backend UserResponseCreateSchema
export interface UserRegisterResponse {
    username: string;
    email: string;
}

// ─── Notes ──────────────────────────────────────────────────
export interface NoteLink {
    id: number;
    source_note_id: number;
    target_note_id: number;
}

// Matches backend NoteReadSchema
export interface Note {
    id: number;
    title: string;
    content: string;
    source: string | null;
    note_type: NoteType;
    user_id: number;
    topic_id?: number | null;
    created_at: string;
    updated_at: string;
}

// Matches backend NoteReadDetailedSchema
export interface NoteDetailed extends Note {
    outgoing_links: NoteLink[];
    incoming_links: NoteLink[];
}

// Matches backend NoteCreateSchema
export interface CreateNoteInput {
    title: string;
    content: string;
    source?: string | null;
    topic_id?: number | null;
    note_type?: NoteType;
}

// Matches backend NoteUpdateSchema (all optional)
export interface UpdateNoteInput {
    title?: string;
    content?: string;
    source?: string | null;
    topic_id?: number | null;
    note_type?: NoteType;
}

// Matches backend NotesPageSchema
export interface NotesPageResponse {
    items: Note[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

export interface UseNotesOptions {
    page?: number;
    pageSize?: number;
}


// ─── AI suggestions ─────────────────────────────────────────
export interface ConnectionSuggestion {
    title: string;
    reason: string;
}

// Matches backend SuggestConnectionsRequest
export interface SuggestConnectionsRequest {
    title: string;
    content: string;
}

// Matches backend SuggestionsSchema
export interface SuggestionsResponse {
    connections: ConnectionSuggestion[];
}

// ─── Graph ──────────────────────────────────────────────────
// Matches backend GraphNodeSchema
export interface GraphNodeData {
    id: number;
    title: string;
    note_type: NoteType;
    link_count: number;
}

// Matches backend GraphEdgeSchema
export interface GraphEdgeData {
    id: number;
    source: number;
    target: number;
}

// Matches backend NoteGraphSchema
export interface NoteGraph {
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
}


// ─── Topics ──────────────────────────────────────────────────

export interface Topic {
    id: number;
    title: string;
    description: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    Note:[]
}

// Matches backend TopicCreateSchema
export interface TopicCreatePayload {
    title: string;
    description: string | null;
}

// Matches backend TopicUpdateSchema (all optional)
export interface TopicUpdatePayload {
    title?: string | null;
    description?: string | null;
    note_id?: string | null;
}

// Matches backend TopicWithNotesSchema
export interface TopicPageResponse {
    items: Topic[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

export interface UseTopicsOptions {
    page?: number;
    pageSize?: number;
}

// ─── Types Paginate list ─────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

export interface UsePaginatedListOptions {
    page?: number;
    pageSize?: number;
}