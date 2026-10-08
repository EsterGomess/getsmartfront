// components/modal.tsx
"use client";

export function Modal({
                          onClose,
                          children,
                          maxWidth = "max-w-md",
                      }: {
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${maxWidth} rounded-lg border-2 border-dashed border-neutral-500 bg-white p-6 shadow-lg`}
            >
                {children}
            </div>
        </div>
    );
}