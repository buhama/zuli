import { Content } from "@tiptap/react";

export interface NoteFolder {
    id: string;
    title: string;
    created_at: number;
    updated_at: number;
    user_id: string;
}

export interface Note {
    id: string;
    folder_id: string;
    content: Content | undefined;
    created_at: number;
    updated_at: number;
    user_id: string;
}