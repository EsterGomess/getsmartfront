import Image from "next/image";
import appIcon from "@/app/favicon.png";

interface AppLogoProps {
    size?: number;
    className?: string;
    priority?: boolean;
}

export function AppLogo({ size = 32, className = "", priority = false }: AppLogoProps) {
    return (
        <Image
            src={appIcon}
            alt="GieokGonggan Logo"
            width={size}
            height={size}
            priority={priority}
            className={`rounded object-contain ${className}`.trim()}
        />
    );
}
