import { Content } from "@tiptap/react";

export interface Journal {
    id: string;
    title: string;
    created_at: number;
    updated_at: number;
    user_id: string
    content: Content | undefined;
    date: string; // YYYY-MM-DD
}

export interface Action {
    id: string;
    content: string;
    journal_id: string;
    user_id: string;
    created_at: number;
}