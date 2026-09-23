"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface GraphToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function GraphToolbar({
    searchQuery,
    onSearchChange,
    placeholder = "Search notes...",
    className = "",
}: GraphToolbarProps) {
    return (
        <div
            className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-4 ${className}`}
        >
            <div className="pointer-events-auto w-full max-w-md rounded-lg border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={placeholder}
                        className="h-8 pl-7 text-xs"
                    />
                </div>
            </div>
        </div>
    );
}
