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
  const [showCorrection, setShowCorrection] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const callCorrectionAPI = async (textToCorrect: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/correct-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToCorrect }),
      });
      const data = await response.json();
      return data.corrected || null;
    } catch (err) {
      console.error("Erreur correction API:", err);
      return null;
    }
  };

  const callTranscribeAndCorrectAPI = async (audioBlob: Blob): Promise<{ transcribed: string | null; corrected: string | null }> => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      
      const response = await fetch("/api/transcribe-and-correct", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return {
        transcribed: data.transcribedText || null,
        corrected: data.correctionText || null,
      };
    } catch (err) {
      console.error("Erreur transcription/correction API:", err);
      return { transcribed: null, corrected: null };
    }
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
    setError(null);

    try {
      let audioUrl = null;
      let textContent = null;
      let correctionText = null;

      if (mode === "speak") {
        // Upload audio
        if (audioBlob) {
          console.log("📤 Upload audio en cours...");
          audioUrl = await uploadAudio(audioBlob, `expr-${Date.now()}`, user, "webm");
          if (!audioUrl) {
            setError("❌ Erreur upload audio. Vérifie ta connexion.");
            setSaving(false);
            return;
          }
          console.log("✓ Audio uploadé:", audioUrl);
        }

        // Transcribe and correct audio
        console.log("🎙️ Transcription et correction de l'audio...");
        const { transcribed, corrected } = await callTranscribeAndCorrectAPI(audioBlob!);
        if (transcribed) {
          textContent = transcribed; // Save transcribed text
          setTranscribedText(transcribed);
          correctionText = corrected;
          console.log("✓ Transcription:", textContent.substring(0, 50) + "...");
        } else {
          console.warn("⚠️ Transcription échouée");
        }
      } else {
        // Writing mode
        textContent = text.trim();
        console.log("✓ Mode écrit, texte:", textContent.substring(0, 50) + "...");
        correctionText = await callCorrectionAPI(textContent);
      }

      console.log("💾 Sauvegarde de la session...");
      const sessionId = await saveExpressionSession(
        media.id,
        media.type,
        media.url,
        audioUrl,
        textContent,
        user,
        correctionText
      );

      if (sessionId) {
        console.log("✅ Session sauvegardée:", sessionId);
        setCorrection(correctionText);
        setShowCorrection(true);
        // Montrer la page de correction pendant 3 secondes puis rediriger
        setTimeout(() => {
          router.push("/exprimer/historique");
        }, 3000);
      } else {
        console.error("❌ saveExpressionSession retourné null");
        setError("❌ Erreur de sauvegarde. Vérifie:\n1. Que tu as une connexion internet\n2. Les logs Supabase (consulte FIX_SUPABASE_403.md)");
      }
    } catch (error) {
      console.error("❌ Erreur générale dans handleSave:", error);
      setError("❌ Erreur technique. Détails en console (F12)");
    } finally {
      setSaving(false);
    } 
  };

  if (!ready || !media) return null;

  // Show correction page
  if (showCorrection) {
  return (
    <div className="page-wrapper">
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✅</p>
          <h2 style={{ color: "var(--text)", margin: "0 0 0.5rem 0" }}>Validé !</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>Ton expression a été sauvegardée</p>
        </div>

        {correction ? (
          <CorrectionBlock correction={correction} />
        ) : (
          <div style={{ textAlign: "center", padding: "1rem", color: "var(--muted)", fontSize: "0.85rem" }}>
            Aucune correction disponible.
          </div>
        )}

        <p style={{ color: "var(--muted)", textAlign: "center", fontSize: "0.85rem", marginTop: "1rem" }}>
          Redirection vers l historique...
        </p>
      </div>
    </div>
  );
}

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

        {/* Error message */}
        {error && (
          <div style={{ background: "#E74C3C22", border: "1.5px solid #E74C3C", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <div>
              <p style={{ fontWeight: "700", color: "#E74C3C", margin: 0, fontSize: "0.9rem" }}>{error}</p>
            </div>
          </div>
        )}

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
                background: text.trim() ? "linear-gradient(135deg, #ff8c00, #fb9200)" : "var(--bg)",
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
function CorrectionBlock({ correction }: { correction: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ marginBottom: "1rem" }}>
      {!visible ? (
        <button
          onClick={() => setVisible(true)}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "12px",
            border: "1.5px solid #27AE60",
            background: "transparent",
            color: "#27AE60",
            fontFamily: "Lato, sans-serif",
            fontSize: "0.88rem",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🤖 Voir la correction IA
        </button>
      ) : (
        <div style={{ background: "linear-gradient(135deg, #27AE6022, #27AE6011)", border: "1.5px solid #27AE60", borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <p style={{ fontWeight: "700", color: "#27AE60", margin: 0, fontSize: "0.9rem" }}>🤖 Correction IA</p>
            <button
              onClick={() => setVisible(false)}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}
            >
              Masquer ✕
            </button>
          </div>
          <div style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "8px",
            padding: "0.75rem",
            fontSize: "0.85rem",
            color: "var(--text)",
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
            maxHeight: "250px",
            overflowY: "auto",
          }}>
            {correction}
          </div>
        </div>
      )}
    </div>
  );
}
function extractYouTubeId(url: string): string {
  const shortUrl = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return shortUrl ? shortUrl[1] : "";
}
