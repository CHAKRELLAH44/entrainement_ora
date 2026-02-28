import { supabase } from "./supabase";
import { ReadingProgress, ReadingReview } from "@/types/books";

// ---- PROGRESS ----

export async function getReadingProgress(
  userNickname: string,
  bookId: string
): Promise<ReadingProgress | null> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_nickname", userNickname)
    .eq("book_id", bookId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userNickname: data.user_nickname,
    bookId: data.book_id,
    currentChapter: data.current_chapter,
    currentPage: data.current_page,
    completed: data.completed,
    startedAt: data.started_at,
    completedAt: data.completed_at,
  };
}

export async function getAllReadingProgress(
  userNickname: string
): Promise<ReadingProgress[]> {
  const { data, error } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_nickname", userNickname);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userNickname: row.user_nickname,
    bookId: row.book_id,
    currentChapter: row.current_chapter,
    currentPage: row.current_page,
    completed: row.completed,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
}

export async function saveReadingProgress(
  progress: Omit<ReadingProgress, "id">
): Promise<void> {
  // Vérifier si une entrée existe déjà
  const { data: existing } = await supabase
    .from("reading_progress")
    .select("id")
    .eq("user_nickname", progress.userNickname)
    .eq("book_id", progress.bookId)
    .maybeSingle();

  if (existing) {
    // Mettre à jour
    const { error } = await supabase
      .from("reading_progress")
      .update({
        current_chapter: progress.currentChapter,
        current_page: progress.currentPage,
        completed: progress.completed,
        completed_at: progress.completedAt || null,
      })
      .eq("id", existing.id);

    if (error) console.error("Erreur update progress:", error);
  } else {
    // Créer
    const { error } = await supabase
      .from("reading_progress")
      .insert({
        user_nickname: progress.userNickname,
        book_id: progress.bookId,
        current_chapter: progress.currentChapter,
        current_page: progress.currentPage,
        completed: progress.completed,
        started_at: progress.startedAt,
        completed_at: progress.completedAt || null,
      });

    if (error) console.error("Erreur insert progress:", error);
  }
}

// ---- REVIEWS ----

export async function getReadingReviews(
  userNickname: string
): Promise<ReadingReview[]> {
  const { data, error } = await supabase
    .from("reading_reviews")
    .select("*")
    .eq("user_nickname", userNickname)
    .order("timestamp", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    userNickname: row.user_nickname,
    bookId: row.book_id,
    bookTitle: row.book_title,
    summary: row.summary,
    summaryCorrected: row.summary_corrected,
    wordsLearned: row.words_learned || [],
    timestamp: row.timestamp,
  }));
}

export async function hasCompletedReview(
  userNickname: string,
  bookId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("reading_reviews")
    .select("id")
    .eq("user_nickname", userNickname)
    .eq("book_id", bookId)
    .maybeSingle();

  return !!data;
}

export async function saveReadingReview(
  review: Omit<ReadingReview, "id">
): Promise<void> {
  const { error } = await supabase.from("reading_reviews").insert({
    user_nickname: review.userNickname,
    book_id: review.bookId,
    book_title: review.bookTitle,
    summary: review.summary,
    summary_corrected: review.summaryCorrected,
    words_learned: review.wordsLearned,
    timestamp: review.timestamp,
  });

  if (error) console.error("Erreur saveReadingReview:", error);
}

export async function deleteAllReadingData(
  userNickname: string
): Promise<void> {
  await supabase
    .from("reading_progress")
    .delete()
    .eq("user_nickname", userNickname);

  await supabase
    .from("reading_reviews")
    .delete()
    .eq("user_nickname", userNickname);
}