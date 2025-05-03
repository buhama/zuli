export interface Reminder {
    id: string;
    title: string;
    description: string;
    created_at: number;
    updated_at: number;
    completed_at: number | null;
    user_id: string;
}