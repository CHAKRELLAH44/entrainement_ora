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

export interface ExpressionSession {
  id: string;
  date: string;
  mediaId: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  audioUrl: string | null;
  text: string | null;
  timestamp: number;
  userNickname: string;
  correction: string | null;
}