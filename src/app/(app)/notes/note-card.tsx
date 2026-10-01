// src/app/(app)/notes/note-card.tsx
import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "@/lib/types";

const typeLabel = {
    FLEETING: "Fleeting",
    LITERATURE: "Literature",
    PERMANENT: "Permanent",
} as const;

export function NoteCard({ note }: { note: Note }) {
    return (
        <Link href={`/notes/${note.id}`}>
            <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                    <CardTitle className="line-clamp-2 text-base">{note.title}</CardTitle>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{note.content}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Badge variant="secondary">{typeLabel[note.note_type]}</Badge>
                    <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
                </CardFooter>
            </Card>
        </Link>
    );
}