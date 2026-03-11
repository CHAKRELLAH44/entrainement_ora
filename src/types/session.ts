export interface Session {
  id: string;
  date: string;
  topic: string;
  note: number;
  audioUrl: string | null;
  text?: string | null;
  timestamp: number;
  userNickname: string;
  correction: string | null;
}