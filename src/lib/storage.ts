import { supabase } from "./supabase";
import { Session } from "@/types/session";

// Test de connexion Supabase
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("sessions").select("count").limit(1);
    if (error) {
      console.error("Test de connexion Supabase échoué:", error);
      return false;
    }
    console.log("Connexion Supabase OK");
    return true;
  } catch (err) {
    console.error("Erreur de connexion Supabase:", err);
    return false;
  }
}

// Diagnostic pour expression_sessions
export async function diagnoseExpressionTable(): Promise<any> {
  console.log("🔍 [Diagnostic] Vérification de la table expression_sessions...");

  try {
    // Test 1: Vérifier que la table peut être lue
    console.log("📖 Test 1: Lecture depuis expression_sessions...");
    const { data: readData, error: readError } = await supabase
      .from("expression_sessions")
      .select("count")
      .limit(1);

    if (readError) {
      console.error("❌ Erreur lecture:", readError);
      return { tableExists: false, readError: readError.message };
    }
    console.log("✓ Lecture OK");

    // Test 2: Essayer un insert test
    console.log("✏️ Test 2: Insert test...");
    const testId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from("expression_sessions")
      .insert([
        {
          id: testId,
          date: new Date().toLocaleDateString("fr-FR"),
          media_id: "test",
          media_type: "image",
          media_url: "https://example.com/test.jpg",
          timestamp: Date.now(),
          user_nickname: "test_user",
        },
      ])
      .select();

    if (insertError) {
      console.error("❌ Erreur insert:", insertError);
      return {
        tableExists: true,
        readOk: true,
        insertError: insertError.message,
        code: insertError.code,
      };
    }

    console.log("✓ Insert test OK, suppression du test...");
    // Nettoyer le test
    await supabase.from("expression_sessions").delete().eq("id", testId);

    return {
      tableExists: true,
      readOk: true,
      insertOk: true,
      message: "✅ Tous les tests sont OK",
    };
  } catch (err) {
    console.error("❌ Erreur diagnostic:", err);
    return { error: String(err) };
  }
}

const LAST_SESSION_KEY = "lastSession";
const LAST_EXPRESSION_KEY = "lastExpression";
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
    text: row.text || null,
    timestamp: row.timestamp,
    userNickname: row.user_nickname,
    correction: row.correction || null,
  }));
}

export async function saveSession(session: Session): Promise<void> {
  console.log("Tentative de sauvegarde de session:", session);
  console.log("URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Clé Supabase:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Définie" : "Non définie");

  // Test rapide de connexion Supabase
  try {
    const testConnection = await supabase.auth.getSession();
    console.log("État de connexion Supabase:", testConnection.data);
  } catch (e) {
    console.warn("⚠️ Impossible de vérifier la connexion Supabase:", e);
  }

  const { data, error } = await supabase.from("sessions").insert({
    id: session.id,
    date: session.date,
    topic: session.topic,
    note: session.note,
    audio_url: session.audioUrl,
    text: session.text,
    timestamp: session.timestamp,
    user_nickname: session.userNickname,
    correction: session.correction,
  });

  console.log("Résultat Supabase - data:", data);
  console.log("Résultat Supabase - error:", error);

  if (error) {
    console.error("❌ Erreur saveSession:", error);
    console.error("Erreur complète (JSON):", JSON.stringify(error, null, 2));
    console.error("Détails de l'erreur:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code    });
    
    // Suggerer les causes possibles
    console.error("📋 Causes possibles:");
    console.error("1. La table 'sessions' n'existe pas dans Supabase");
    console.error("2. Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL/KEY ne sont pas définies");
    console.error("3. L'utilisateur n'a pas les permissions pour insérer dans 'sessions'");
    console.error("4. Un conflit avec un ID de session en doublon");
  } else {
    console.log("✅ Session sauvegardée avec succès");
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
  // Sans sessions, on n'a pas de streak
  if (sessions.length === 0) return 0;

  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  let streak = 1;
  let prevDate = new Date(sorted[0].timestamp);
  prevDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const currDate = new Date(sorted[i].timestamp);
    currDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
      prevDate = currDate;
    } else if (diffDays > 1) {
      break;
    }
    // if diffDays === 0, same day: continue to next session
  }

  return streak;
}

// ---- Expression Sessions ----
export async function saveExpressionSession(
  mediaId: string,
  mediaType: "video" | "image",
  mediaUrl: string,
  audioUrl: string | null,
  text: string | null,
  userNickname: string,
  correction: string | null = null
): Promise<string | null> {
  const id = `expr-${Date.now()}`;
  const now = new Date();
  const date = now.toLocaleDateString("fr-FR");

  const payload = {
    id,
    date,
    media_id: mediaId,
    media_type: mediaType,
    media_url: mediaUrl,
    audio_url: audioUrl,
    text: text,
    timestamp: Date.now(),
    user_nickname: userNickname,
    correction: correction,
  };

  console.log("💾 [saveExpressionSession] Tentative d'insertion avec payload:", {
    id,
    userNickname,
    mediaId,
    hasAudio: !!audioUrl,
    hasText: !!text,
    hasCorrection: !!correction,
  });

  const { data, error } = await supabase.from("expression_sessions").insert([payload]).select();

  if (error) {
    console.error("❌ [saveExpressionSession] Erreur Supabase complète:", {
      error: error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      statusCode: (error as any).statusCode,
    });
    console.error("📋 Payload qui a échoué:", payload);
    return null;
  }

  console.log("✅ [saveExpressionSession] Insertion réussie:", {
    id,
    data,
  });
  
  setLastExpressionTimestamp();
  return id;
}

export function getLastExpressionTimestamp(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LAST_EXPRESSION_KEY) || "0", 10);
}

export function setLastExpressionTimestamp(): void {
  localStorage.setItem(LAST_EXPRESSION_KEY, Date.now().toString());
}

export function getHoursUntilNextExpression(): number {
  const last = getLastExpressionTimestamp();
  if (!last) return 0;
  const diff = 24 * 60 * 60 * 1000 - (Date.now() - last);
  if (diff <= 0) return 0;
  return Math.ceil(diff / (60 * 60 * 1000));
}

export async function getExpressionSessions(userNickname: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("expression_sessions")
    .select("*")
    .eq("user_nickname", userNickname)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Erreur getExpressionSessions:", error);
    return [];
  }
  return data || [];
}