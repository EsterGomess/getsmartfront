// src/components/ui/segmented-control.tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
    value: string;
    label: string;
    /** Optional helper text rendered below the label. */
    hint?: string;
}

interface SegmentedControlProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SegmentedControlOption[];
    /** Name passed to the underlying radio group (form submissions, testing). */
    name?: string;
    className?: string;
    disabled?: boolean;
}

export function SegmentedControl({
                                     value,
                                     onValueChange,
                                     options,
                                     name,
                                     className,
                                     disabled,
                                 }: SegmentedControlProps) {
    return (
        <RadioGroupPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            name={name}
            disabled={disabled}
            className={cn(
                "inline-flex w-full gap-1 rounded border border-neutral-300 bg-neutral-50 p-1",
                disabled && "opacity-50 pointer-events-none",
                className,
            )}
        >
            {options.map((opt) => (
                <RadioGroupPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    className={cn(
                        "flex flex-1 flex-col items-center justify-center gap-0.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                        "cursor-pointer text-neutral-500",
                        "hover:text-neutral-800",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1",
                        "data-[state=checked]:bg-neutral-800 data-[state=checked]:text-white",
                    )}
                >
                    <span>{opt.label}</span>
                    {opt.hint && (
                        <span className="text-[10px] font-normal opacity-70">
              {opt.hint}
            </span>
                    )}
                </RadioGroupPrimitive.Item>
            ))}
        </RadioGroupPrimitive.Root>
    );
}