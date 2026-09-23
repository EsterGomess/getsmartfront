"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<
    HTMLInputElement,
    React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                ref={ref}
                type={visible ? "text" : "password"}
                className={cn("pr-10", className)}
                {...props}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                aria-label={visible ? "Hide password" : "Show password"}
            >
                {visible ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                )}
            </Button>
        </div>
    );
});
PasswordInput.displayName = "PasswordInput";