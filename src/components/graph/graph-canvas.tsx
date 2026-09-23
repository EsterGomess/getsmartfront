"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { NoteGraph, NoteType } from "@/lib/types";
import { NoteNode } from "./note-node";
import { TYPE_FILL } from "./graph-constants";
import { computePositions, buildFlow } from "./graph-utils";
import { GraphToolbar } from "./graph-toolbar";
import { GraphSearchEmpty } from "./graph-empty";

const nodeTypes = { note: NoteNode };

export interface GraphCanvasProps {
    graph: NoteGraph;
}

export function GraphCanvas({ graph }: GraphCanvasProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // ─── Filter ─────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const keepIds = new Set(
            graph.nodes
                .filter((n) => (q ? n.title.toLowerCase().includes(q) : true))
                .map((n) => n.id),
        );

        return {
            nodes: graph.nodes.filter((n) => keepIds.has(n.id)),
            edges: graph.edges.filter(
                (e) => keepIds.has(e.source) && keepIds.has(e.target),
            ),
        };
    }, [graph, query]);

    // ─── Layout ─────────────────────────────────────────────
    const positions = useMemo(() => computePositions(filtered), [filtered]);

    // ─── Hover highlight ────────────────────────────────────
    const highlightSet = useMemo(() => {
        if (!hoveredId) return null;
        const s = new Set<string>([hoveredId]);
        for (const e of filtered.edges) {
            if (String(e.source) === hoveredId) s.add(String(e.target));
            if (String(e.target) === hoveredId) s.add(String(e.source));
        }
        return s;
    }, [hoveredId, filtered]);

    const { nodes, edges } = useMemo(
        () => buildFlow(filtered, positions, highlightSet),
        [filtered, positions, highlightSet],
    );

    // ─── Interaction ────────────────────────────────────────
    const onNodeClick: NodeMouseHandler = useCallback(
        (_, node) => router.push(`/notes/${node.id}`),
        [router],
    );
    const onNodeMouseEnter: NodeMouseHandler = useCallback(
        (_, node) => setHoveredId(node.id),
        [],
    );
    const onNodeMouseLeave: NodeMouseHandler = useCallback(
        () => setHoveredId(null),
        [],
    );

    return (
        <div className="relative h-full min-h-[500px] w-full flex-1 bg-neutral-50">
            <GraphToolbar searchQuery={query} onSearchChange={setQuery} />

            {nodes.length === 0 ? (
                <GraphSearchEmpty />
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodeClick={onNodeClick}
                    onNodeMouseEnter={onNodeMouseEnter}
                    onNodeMouseLeave={onNodeMouseLeave}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                    maxZoom={2}
                    proOptions={{ hideAttribution: true }}
                    className="h-full w-full"
                >
                    <Background gap={16} size={1} color="#e5e5e5" />
                    <Controls showInteractive={false} />
                    <MiniMap
                        pannable
                        zoomable
                        nodeColor={(n) =>
                            TYPE_FILL[(n.data?.note_type as NoteType) ?? "FLEETING"]
                        }
                        maskColor="rgba(240, 240, 240, 0.6)"
                    />
                </ReactFlow>
            )}
        </div>
    );
}
