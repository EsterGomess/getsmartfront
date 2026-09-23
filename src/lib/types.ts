// lib/types.ts


export type NoteType = "FLEETING" | "LITERATURE" | "PERMANENT";

// ─── Payloads (entry) ───────────────────────────────────────

export interface UserLoginPayload {
    username: string;
    password: string;
}

// ─── Response (output) ────────────────────────────────────────

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: number;
    username: string;
}

export interface UserLoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface NoteLink {
    id: number;
    source_note_id: number;
    target_note_id: number;
}

export interface Note {
    id: number;
    title: string;
    content: string;
    source: string | null;
    note_type: NoteType;
    user_id: number;
    created_at: string;
    updated_at: string;
    outgoing_links?: NoteLink[];
    incoming_links?: NoteLink[];
}


export interface NotesPageResponse {
    items: Note[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

export interface UserRegisterPayload {
    username: string;
    password: string;
}

export interface UserRegisterResponse {
    id: number;
    username: string;

}

// ─── Graph ─────────────────────────────────────────────────

export interface GraphNodeData {
    id: number;
    title: string;
    note_type: NoteType;
    link_count: number;
}

export interface GraphEdgeData {
    id: number;
    source: number;
    target: number;
}

export interface NoteGraph {
    nodes: GraphNodeData[];
    edges: GraphEdgeData[];
}
