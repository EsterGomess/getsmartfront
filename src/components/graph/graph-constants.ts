import type { NoteType } from "@/lib/types";

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 64;

export const TYPE_FILL: Record<NoteType, string> = {
    FLEETING: "#fcd34d",
    LITERATURE: "#7dd3fc",
    PERMANENT: "#6ee7b7",
};

export const TYPE_STYLES: Record<
    NoteType,
    { bg: string; border: string; text: string; dot: string }
> = {
    FLEETING: {
        bg: "#fef3c7",
        border: "#fcd34d",
        text: "#92400e",
        dot: "#f59e0b",
    },
    LITERATURE: {
        bg: "#e0f2fe",
        border: "#7dd3fc",
        text: "#075985",
        dot: "#0ea5e9",
    },
    PERMANENT: {
        bg: "#d1fae5",
        border: "#6ee7b7",
        text: "#065f46",
        dot: "#10b981",
    },
};
