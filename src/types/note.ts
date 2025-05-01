export interface Note {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  created_at: string;
  type: 'text' | 'task' | 'checklist';
} 