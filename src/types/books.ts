export interface BookChapter {
  title: string;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  level: "Facile" | "Moyen" | "Difficile";
  estimatedMinutes: number;
  cover: string; // emoji
  chapters: BookChapter[];
}

export interface ReadingProgress {
  id: string;
  userNickname: string;
  bookId: string;
  currentChapter: number;
  currentPage: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface ReadingReview {
  id: string;
  userNickname: string;
  bookId: string;
  bookTitle: string;
  summary: string;
  summaryCorrected: string | null;
  wordsLearned: { word: string; definition: string }[];
  timestamp: number;
}