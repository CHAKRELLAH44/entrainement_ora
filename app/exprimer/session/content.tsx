"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, uploadAudio, saveExpressionSession } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import AudioRecorder, { AudioRecorderHandle } from "@/components/AudioRecorder";
import { expressionMediaList, ExpressionMedia } from "@/data/expression-media";

export default function ExpressionSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLang();
  const mediaId = searchParams.get("mediaId");
  const mode = searchParams.get("mode") as "speak" | "write" || "speak";
  
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<ExpressionMedia | null>(null);

  const recorderRef = useRef<AudioRecorderHandle>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    // Find media
    const selectedMedia = expressionMediaList.find((m: ExpressionMedia) => m.id === mediaId);
    if (!selectedMedia) {
      router.push("/exprimer");
      return;
    }
    setMedia(selectedMedia);
    setReady(true);
  }, [mediaId, router]);

  const handleStartRecording = async () => {
    if (!recorderRef.current) return;
    try {
      await recorderRef.current.start();
      setRecording(true);
    } catch (e) {
      console.error("Erreur démarrage enregistrement:", e);
    }
  };

  const handleStopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setRecording(false);
  };

  const handleRecordingComplete = (blob: Blob | null) => {
    if (!blob) {
      alert("Erreur lors de l'enregistrement. Vérifie tes permissions d'accès au micro.");
      return;
    }
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setRecordedAudioUrl(url);
  };

  const handleSave = async () => {
    if (!user || !media) return;
    
    // Validation
    if (mode === "speak" && !recordedAudioUrl) {
      alert("Enregistre d'abord ton avis audio.");
      return;
    }
    if (mode === "write" && !text.trim()) {
      alert("Écris d'abord ton avis.");
      return;
    }
    
    setSaving(true);

    try {
      let audioUrl = null;
      if (audioBlob) {
        audioUrl = await uploadAudio(audioBlob, `expr-${Date.now()}`, user, "webm");
      }

      const sessionId = await saveExpressionSession(
        media.id,
        media.type,
        media.url,
        audioUrl,
        mode === "write" ? text.trim() : null,
        user
      );

      if (sessionId) {
        router.push("/exprimer/historique");
      } else {
        alert("Erreur lors de la sauvegarde. Réessaye.");
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Une erreur s'est produite.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready || !media) return null;

  return (
    <div className="page-wrapper">
      <div className="card">
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/exprimer" style={{ color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            ← {t("back")}
          </Link>
        </div>

        <h1 style={{ marginBottom: "0.5rem" }}>🎬 {t("recordYourOpinion")}</h1>

        {/* Media Preview */}
        <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "16px", padding: "1rem", marginBottom: "1.5rem", overflow: "hidden" }}>
          {media.type === "video" ? (
            <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px" }}>
              <iframe
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "12px",
                }}
                src={`https://www.youtube.com/embed/${extractYouTubeId(media.url)}?rel=0&modestbranding=1`}
                allowFullScreen
                title={media.title}
              />
            </div>
          ) : (
            <img
              src={media.url}
              alt={media.title}
              style={{ width: "100%", borderRadius: "12px", maxHeight: "300px", objectFit: "cover" }}
            />
          )}
        </div>

        {mode === "speak" ? (
          <>
            <AudioRecorder ref={recorderRef} onRecordingComplete={handleRecordingComplete} />

            {/* Recording state */}
            {recording && (
              <div style={{ background: "#E74C3C22", border: "1.5px solid #E74C3C", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", animation: "pulse 1s infinite" }}>
                <span style={{ fontSize: "1.5rem" }}>🔴</span>
                <div>
                  <p style={{ fontWeight: "700", color: "#E74C3C", margin: 0, fontSize: "0.9rem" }}>{t("recording")}</p>
                </div>
              </div>
            )}

            {/* Recorded audio playback */}
            {recordedAudioUrl && (
              <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
                <p style={{ fontWeight: "700", color: "var(--text)", margin: "0 0 0.75rem 0", fontSize: "0.9rem" }}>🎧 {t("whatYouSaid")}</p>
                <audio
                  controls
                  preload="metadata"
                  src={recordedAudioUrl}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </div>
            )}
          </>
        ) : (
          /* Writing mode */
          <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: "0 0 0.75rem 0", fontSize: "0.9rem" }}>✍️ {t("yourSummary")}</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Exprime-toi librement sur ce que tu vois..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "1rem",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                background: "var(--card)",
                color: "var(--text)",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0.5rem 0 0 0" }}>
              {text.length} caractères
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: mode === "speak" ? "1fr 1fr" : "1fr", gap: "0.75rem", marginBottom: "1rem" }}>
          {mode === "speak" ? (
            !recording ? (
              <>
                <button
                  onClick={handleStartRecording}
                  disabled={saving}
                  style={{
                    background: "linear-gradient(135deg, #F98F0B, #FF6B00)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "0.85rem 1rem",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  🎙️ {t("start")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!recordedAudioUrl || saving}
                  style={{
                    background: recordedAudioUrl ? "var(--card)" : "var(--bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                    padding: "0.85rem 1rem",
                    color: "var(--text)",
                    fontWeight: "700",
                    cursor: recordedAudioUrl && !saving ? "pointer" : "not-allowed",
                    opacity: recordedAudioUrl && !saving ? 1 : 0.5,
                  }}
                >
                  {saving ? "⏳ " + t("sending") : `✓ ${t("validate")}`}
                </button>
              </>
            ) : (
              <button
                onClick={handleStopRecording}
                style={{
                  background: "#E74C3C",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  gridColumn: "1 / -1",
                }}
              >
                ⏹️ Arrêter
              </button>
            )
          ) : (
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              style={{
                background: text.trim() ? "linear-gradient(135deg, #9B59B6, #8E44AD)" : "var(--bg)",
                border: "none",
                borderRadius: "12px",
                padding: "0.85rem 1rem",
                color: text.trim() ? "#fff" : "var(--muted)",
                fontWeight: "700",
                cursor: text.trim() && !saving ? "pointer" : "not-allowed",
                opacity: text.trim() && !saving ? 1 : 0.5,
              }}
            >
              {saving ? "⏳ " + t("sending") : `✓ ${t("validate")}`}
            </button>
          )}
        </div>

        <Link href="/exprimer" style={{ display: "block", textAlign: "center", color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem" }}>
          {t("back")}
        </Link>
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const shortUrl = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return shortUrl ? shortUrl[1] : "";
}
