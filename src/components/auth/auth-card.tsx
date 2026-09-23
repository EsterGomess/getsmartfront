import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
            {footer && (
                <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
                    {footer}
                </div>
            )}
        </Card>
    );
}