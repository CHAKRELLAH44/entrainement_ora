"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Timer from "@/components/Timer";
import RatingSlider from "@/components/RatingSlider";
import { saveSession, setLastSessionTimestamp, getCurrentUser, uploadAudio } from "@/lib/storage";
import { Session } from "@/types/session";

type Step = "topic" | "think" | "speak" | "review" | "saving" | "result";

function getMessage(note: number): { emoji: string; msg: string } {
  if (note >= 8) return { emoji: "👏", msg: "Excellent travail ! Continue ainsi." };
  if (note >= 5) return { emoji: "👍", msg: "Bon effort ! Continue a structurer tes idees." };
  return { emoji: "💪", msg: "Chaque jour compte. Continue a pratiquer." };
}

export default function SessionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(7);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  async function rollTopic() {
    setLoading(true);
    try {
      const res = await fetch("/api/random-topic");
      const data = await res.json();
      setTopic(data.topic);
    } catch {
      setTopic("Decris ta ville ideale");
    } finally {
      setLoading(false);
    }
  }

  async function startSpeaking() {
    // Démarrer le micro
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setStep("review");
      };

      recorder.start(100); // chunk toutes les 100ms
    } catch {
      // Micro non dispo, on passe quand meme
      setStep("review");
    }

    setStep("speak");
  }

  function handleTimerComplete() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      // onstop appellera setStep("review")
    } else {
      setStep("review");
    }
  }

  async function validateSession() {
    setStep("saving");
    const user = getCurrentUser() || "default";
    const sessionId = Date.now().toString();

    let audioUrl: string | null = null;
    if (audioBlobRef.current) {
      audioUrl = await uploadAudio(audioBlobRef.current, sessionId, user);
    }

    const session: Session = {
      id: sessionId,
      date: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      topic: topic!,
      note,
      audioUrl,
      timestamp: Date.now(),
      userNickname: user,
    };

    await saveSession(session);
    setLastSessionTimestamp();
    setStep("result");
  }

  const { emoji, msg } = getMessage(note);

  return (
    <div className="page-wrapper">

      {/* ---- STEP : topic ---- */}
      {step === "topic" && (
        <div className="card">
          <div className="nav-top">
            <button className="back-btn" onClick={() => router.push("/intro")}>
              &larr;
            </button>
            <div className="chip">Sujet</div>
            <div style={{ width: 24 }} />
          </div>
          <h2>Tire ton sujet</h2>
          <p>Lance le de pour decouvrir ton sujet du jour.</p>
          <button className="btn btn-outline" onClick={rollTopic} disabled={loading}>
            {loading ? "..." : "🎲 Lancer le de"}
          </button>
          {topic && (
            <>
              <div className="topic-box">
                <div className="label">🎤 Sujet du jour</div>
                <div className="text">{topic}</div>
              </div>
              <button className="btn" onClick={() => setStep("think")}>
                Demarrer
              </button>
            </>
          )}
        </div>
      )}

      {/* ---- STEP : think ---- */}
      {step === "think" && (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="chip">Reflexion</div>
          <div className="topic-box" style={{ textAlign: "left" }}>
            <div className="label">🎤 Sujet</div>
            <div className="text">{topic}</div>
          </div>
          <Timer
            total={60}
            onComplete={startSpeaking}
            label="Temps de reflexion"
            sublabel="Organise tes idees"
          />
        </div>
      )}

      {/* ---- STEP : speak ---- */}
      {step === "speak" && (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="chip">Parole</div>
          <div className="topic-box" style={{ textAlign: "left" }}>
            <div className="label">🎤 Sujet</div>
            <div className="text">{topic}</div>
          </div>
          <div className="rec-indicator">
            <div className="rec-dot" /> Enregistrement en cours
          </div>
          <Timer
            total={60}
            onComplete={handleTimerComplete}
            label="Temps de parole"
            sublabel="Exprime-toi librement"
          />
        </div>
      )}

      {/* ---- STEP : review ---- */}
      {step === "review" && (
        <div className="card">
          <div className="chip">Bilan</div>
          <h2>Comment ca s est passe ?</h2>
          <div className="topic-box">
            <div className="label">🎤 Sujet</div>
            <div className="text">{topic}</div>
          </div>
          {audioPreviewUrl ? (
            <>
              <p className="audio-label">🎧 Reecouter</p>
              <audio className="audio-player" controls src={audioPreviewUrl} />
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Micro non disponible
            </p>
          )}
          <RatingSlider value={note} onChange={setNote} />
          <button className="btn" onClick={validateSession}>
            Valider
          </button>
        </div>
      )}

      {/* ---- STEP : saving ---- */}
      {step === "saving" && (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="chip">Sauvegarde</div>
          <p style={{ marginTop: "2rem", fontSize: "1.5rem" }}>💾</p>
          <p>Envoi en cours...</p>
        </div>
      )}

      {/* ---- STEP : result ---- */}
      {step === "result" && (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="chip">Termine</div>
          <div className="message-box">
            <div className="emoji">{emoji}</div>
            <div className="msg">{msg}</div>
          </div>
          <p>Seance enregistree !</p>
          <button className="btn" onClick={() => router.push("/dashboard")}>
            Voir mes seances
          </button>
          <button className="btn btn-ghost" onClick={() => router.push("/")}>
            Retour a l accueil
          </button>
        </div>
      )}

    </div>
  );
}