// src/components/notes/empty.tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon;
}

export function Empty({ icon: Icon, className, children, ...props }: EmptyProps) {
    return (
        <div
            className={cn(
                "flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
                className,
            )}
            {...props}
        >
            {Icon && <Icon className="h-10 w-10 text-muted-foreground" />}
            {children}
        </div>
    );
}

export function EmptyTitle({
                               className,
                               ...props
                           }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("text-lg font-semibold text-foreground", className)}
            {...props}
        />
    );
}

export function EmptyDescription({
                                     className,
                                     ...props
                                 }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("max-w-sm text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

export function EmptyAction({
                                className,
                                ...props
                            }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("mt-4", className)} {...props} />;
}