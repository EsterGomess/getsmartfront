"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Link2 } from "lucide-react";
import type { NoteType } from "@/lib/types";
import { TYPE_STYLES } from "./graph-constants";

export interface NoteNodeData {
    label: string;
    note_type: NoteType;
    link_count: number;
}

function NoteNodeComponent({ data }: NodeProps) {
    const d = data as unknown as NoteNodeData;
    const s = TYPE_STYLES[d.note_type] ?? TYPE_STYLES.FLEETING;

    return (
        <div
            className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-center shadow-sm transition-shadow hover:shadow-md"
            style={{
                background: s.bg,
                border: `2px solid ${s.border}`,
                color: s.text,
            }}
        >
            {/* Invisible handles so edges connect at the sides */}
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={false}
                style={{ opacity: 0, width: 1, height: 1, border: 0 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                isConnectable={false}
                style={{ opacity: 0, width: 1, height: 1, border: 0 }}
            />

            <p className="line-clamp-2 text-xs font-semibold leading-tight">
                {d.label}
            </p>

            <div className="flex items-center gap-1 text-[10px] opacity-70">
                <Link2 className="h-2.5 w-2.5" />
                <span>{d.link_count} {d.link_count === 1 ? "link" : "links"}</span>
            </div>
        </div>
    );
}

export const NoteNode = memo(NoteNodeComponent);
