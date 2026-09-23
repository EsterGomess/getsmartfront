import Link from "next/link";
import { FileText } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "@/lib/types";

const typeLabels: Record<Note["note_type"], string> = {
    FLEETING: "Fleeting",
    LITERATURE: "Literature",
    PERMANENT: "Permanent",
};

interface NoteCardProps {
    note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
    return (
        <Link href={`/notes/${note.id}`} className="block">
            <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <CardTitle className="line-clamp-2 text-base">{note.title}</CardTitle>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                        {note.content || "No content"}
                    </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                    <Badge variant="secondary">{typeLabels[note.note_type]}</Badge>
                    <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
                </CardFooter>
            </Card>
        </Link>
    );
}