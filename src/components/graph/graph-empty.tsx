"use client";

import { Network } from "lucide-react";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/notes/empty";

export function GraphEmpty() {
    return (
        <div className="flex h-[calc(100vh-7.5rem)] w-full flex-1 items-center justify-center p-8">
            <Empty icon={Network} className="border-none">
                <EmptyTitle>No notes to display</EmptyTitle>
                <EmptyDescription>
                    Create notes and link them to see your graph grow.
                </EmptyDescription>
            </Empty>
        </div>
    );
}

export function GraphSearchEmpty() {
    return (
        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
            No notes match your search.
        </div>
    );
}
