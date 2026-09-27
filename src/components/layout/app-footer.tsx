interface AppFooterProps {
    className?: string;
    children?: React.ReactNode;
}

export function AppFooter({ className = "", children }: AppFooterProps) {
    return (
        <footer
            className={`sticky bottom-0 z-10 border-t border-dashed border-neutral-400 bg-white/80 backdrop-blur-sm ${className}`.trim()}
        >
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-xs text-neutral-500">
                <span>© 2026 Ideiateca</span>
                {children ? (
                    children
                ) : (
                    <div className="flex gap-4">
                        <a href="#" className="underline underline-offset-2 hover:text-neutral-800">
                            Terms
                        </a>
                        <a href="#" className="underline underline-offset-2 hover:text-neutral-800">
                            Privacy
                        </a>
                    </div>
                )}
            </div>
        </footer>
    );
}
