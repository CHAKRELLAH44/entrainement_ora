import { supabase } from "./supabase";
import { Session } from "@/types/session";

const LAST_SESSION_KEY = "lastSession";
const USER_KEY = "currentUser";

export function getCurrentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}

export function setCurrentUser(nickname: string): void {
  localStorage.setItem(USER_KEY, nickname);
}

export function logoutUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_SESSION_KEY);
}

export async function checkUserAllowed(nickname: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("allowed_users")
    .select("nickname")
    .ilike("nickname", nickname)
    .single();
  if (error || !data) return false;
  return true;
}

export async function uploadAudio(
  blob: Blob,
  sessionId: string,
  userNickname: string,
  ext: string = "webm"
): Promise<string | null> {
  const fileName = `${userNickname}/${sessionId}.${ext}`;
  await supabase.storage.from("audio-sessions").remove([fileName]);
  const { error } = await supabase.storage
    .from("audio-sessions")
    .upload(fileName, blob, {
      contentType: blob.type || "audio/webm",
      upsert: true,
      cacheControl: "3600",
    });
  if (error) {
    console.error("Erreur upload audio:", error.message);
    return null;
  }
  const { data: urlData } = supabase.storage
    .from("audio-sessions")
    .getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function getSessions(userNickname: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_nickname", userNickname)
    .order("timestamp", { ascending: false });
  if (error) {
    console.error("Erreur getSessions:", error);
    return [];
  }
  return (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    topic: row.topic,
    note: row.note,
    audioUrl: row.audio_url,
    timestamp: row.timestamp,
    userNickname: row.user_nickname,
    correction: row.correction || null,
  }));
}

export async function saveSession(session: Session): Promise<void> {
  const { error } = await supabase.from("sessions").insert({
    id: session.id,
    date: session.date,
    topic: session.topic,
    note: session.note,
    audio_url: session.audioUrl,
    timestamp: session.timestamp,
    user_nickname: session.userNickname,
    correction: session.correction,
  });
  if (error) {
    console.error("Erreur saveSession:", error);
  }
}

export async function deleteAllSessions(userNickname: string): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("user_nickname", userNickname);
  if (error) {
    console.error("Erreur deleteAllSessions:", error);
  }
}

export function getLastSessionTimestamp(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LAST_SESSION_KEY) || "0", 10);
}

export function setLastSessionTimestamp(): void {
  localStorage.setItem(LAST_SESSION_KEY, Date.now().toString());
}

export function getHoursUntilNextSession(): number {
  const last = getLastSessionTimestamp();
  if (!last) return 0;
  const diff = 24 * 60 * 60 * 1000 - (Date.now() - last);
  if (diff <= 0) return 0;
  return Math.ceil(diff / (60 * 60 * 1000));
}

export function canStartSession(): boolean {
  return getHoursUntilNextSession() === 0;
}

// ---- Streak ----
export function calculateStreak(sessions: Session[]): number {
  // Meme sans sessions on commence a 3
  if (sessions.length === 0) return 3;

  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  let streak = 1;
  let prevDate = new Date(sorted[0].timestamp);
  prevDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const currDate = new Date(sorted[i].timestamp);
    currDate.setHours(0, 0, 0, 0);
    const diff = prevDate.getTime() - currDate.getTime();
    if (diff === 86400000) {
      streak++;
      prevDate = currDate;
    } else if (diff > 86400000) {
      break;
    }
  }

  return Math.max(streak, 3);
}