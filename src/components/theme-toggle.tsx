"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    // Read the initial value from localStorage during initialization.
    // The function form of useState runs only once, on the client.
    const [dark, setDark] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("theme") === "dark";
    });

    // Sync the DOM and localStorage with the state.
    // The effect only updates EXTERNAL systems — no setState here.
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setDark((v) => !v)}
            aria-label="Toggle theme"
        >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}