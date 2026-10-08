"use client";

import { Suspense } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useNoteGraph } from "@/lib/notes/notes-store";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphEmpty } from "@/components/graph/graph-empty";

function GraphLoader() {
    const { graph, loading, error } = useNoteGraph();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-7.5rem)] w-full flex-1 items-center justify-center text-sm text-neutral-500">
                Loading graph...
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex h-[calc(100vh-7.5rem)] w-full flex-1 items-center justify-center text-sm text-red-600">
                {error}
            </div>
        );
    }
    if (!graph || graph.nodes.length === 0) {
        return <GraphEmpty />;
    }

    return (
        <ReactFlowProvider>
            <GraphCanvas graph={graph} />
        </ReactFlowProvider>
    );
}

export default function GraphPage() {
    return (
        <main className="flex h-[calc(100vh-7.5rem)] w-full flex-1 flex-col">
            <Suspense
                fallback={
                    <div className="flex h-[calc(100vh-7.5rem)] w-full flex-1 items-center justify-center text-sm text-neutral-500">
                        Loading graph...
                    </div>
                }
            >
                <GraphLoader />
            </Suspense>
        </main>
    );
}
