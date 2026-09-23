import dagre from "@dagrejs/dagre";
import { MarkerType, type Node, type Edge } from "@xyflow/react";
import type { NoteGraph } from "@/lib/types";
import { NODE_WIDTH, NODE_HEIGHT } from "./graph-constants";
import type { NoteNodeData } from "./note-node";

/**
 * Computes node positions using Dagre layout algorithm (Left-to-Right).
 */
export function computePositions(
    graph: NoteGraph,
): Map<number, { x: number; y: number }> {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 100, marginx: 40, marginy: 40 });
    g.setDefaultEdgeLabel(() => ({}));

    for (const n of graph.nodes) {
        g.setNode(String(n.id), { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const e of graph.edges) {
        g.setEdge(String(e.source), String(e.target));
    }

    dagre.layout(g);

    const positions = new Map<number, { x: number; y: number }>();
    for (const n of graph.nodes) {
        const pos = g.node(String(n.id));
        positions.set(n.id, { x: pos.x, y: pos.y });
    }
    return positions;
}

/**
 * Transforms NoteGraph entities into ReactFlow Nodes and Edges with styles and highlight effects.
 */
export function buildFlow(
    graph: NoteGraph,
    positions: Map<number, { x: number; y: number }>,
    highlight: Set<string> | null,
): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = graph.nodes.map((n) => {
        const pos = positions.get(n.id) ?? { x: 0, y: 0 };
        const dimmed = highlight !== null && !highlight.has(String(n.id));

        return {
            id: String(n.id),
            type: "note",
            position: {
                x: pos.x - NODE_WIDTH / 2,
                y: pos.y - NODE_HEIGHT / 2,
            },
            data: {
                label: n.title,
                note_type: n.note_type,
                link_count: n.link_count,
            } satisfies NoteNodeData,
            style: {
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                opacity: dimmed ? 0.15 : 1,
                transition: "opacity 150ms ease",
            },
        };
    });

    const edges: Edge[] = graph.edges.map((e) => {
        const isHighlighted =
            highlight === null ||
            (highlight.has(String(e.source)) && highlight.has(String(e.target)));
        const color = isHighlighted ? "#a1a1aa" : "#e5e5e5";

        return {
            id: String(e.id),
            source: String(e.source),
            target: String(e.target),
            style: {
                stroke: color,
                strokeWidth: isHighlighted ? 1.5 : 1,
                transition: "stroke 150ms ease",
            },
            markerEnd: { type: MarkerType.ArrowClosed, color },
        };
    });

    return { nodes, edges };
}
