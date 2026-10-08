// src/components/pagination.tsx
"use client";

import * as React from "react";
import {
    Pagination as PaginationRoot,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────

export interface PaginationProps {
    page: number;
    pages: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    /** Noun shown in the summary line. Defaults to "items". */
    itemLabel?: string;
    className?: string;
}

// ─── Helpers ───────────────────────────────────────────────

function getPageNumbers(
    currentPage: number,
    totalPages: number,
): (number | "ellipsis")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (currentPage > 3) pages.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
}

// ─── Component ─────────────────────────────────────────────

/**
 * Dashed-style pagination with numbered pages and ellipsis. Used by
 * every paginated list. Renders the summary line even when there's
 * only one page (so "Showing 1–8 of 8" is always visible), but hides
 * the page controls.
 */
export function Pagination({
                               page,
                               pages,
                               total,
                               pageSize,
                               onPageChange,
                               itemLabel = "items",
                               className,
                           }: PaginationProps) {
    if (total === 0) return null;

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);
    const pageNumbers = getPageNumbers(page, pages);

    return (
        <div
            className={cn(
                "mt-8 flex flex-col items-center justify-between gap-4 border-t border-dashed border-neutral-300 pt-6 sm:flex-row",
                className,
            )}
        >
            <div className="text-xs text-neutral-500">
                Showing{" "}
                <span className="font-medium text-neutral-700">{startItem}</span> to{" "}
                <span className="font-medium text-neutral-700">{endItem}</span> of{" "}
                <span className="font-medium text-neutral-700">{total}</span>{" "}
                {itemLabel}
            </div>

            {pages > 1 && (
                <PaginationRoot className="mx-0 w-auto justify-end">
                    <PaginationContent className="gap-1">
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) onPageChange(page - 1);
                                }}
                                className={cn(
                                    "cursor-pointer select-none",
                                    page <= 1 &&
                                    "pointer-events-none cursor-not-allowed opacity-40",
                                )}
                                aria-disabled={page <= 1}
                            />
                        </PaginationItem>

                        {pageNumbers.map((p, idx) => (
                            <PaginationItem
                                key={p === "ellipsis" ? `ellipsis-${idx}` : p}
                            >
                                {p === "ellipsis" ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={p === page}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (p !== page) onPageChange(p);
                                        }}
                                        className={cn(
                                            "cursor-pointer select-none",
                                            p === page
                                                ? "border-neutral-500 bg-neutral-100 font-semibold text-neutral-900"
                                                : "text-neutral-600 hover:bg-neutral-50",
                                        )}
                                    >
                                        {p}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < pages) onPageChange(page + 1);
                                }}
                                className={cn(
                                    "cursor-pointer select-none",
                                    page >= pages &&
                                    "pointer-events-none cursor-not-allowed opacity-40",
                                )}
                                aria-disabled={page >= pages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </PaginationRoot>
            )}
        </div>
    );
}