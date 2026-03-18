import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    console.log("📝 TRANSCRIPTION + CORRECTION D'AUDIO");
    console.log("Audio type:", audioFile.type);
    console.log("Audio size:", audioFile.size);

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Groq supporte ces formats : mp3, mp4, mpeg, mpga, m4a, wav, webm
    const blob = new Blob([buffer], { type: "audio/webm" });
    const file = new File([blob], "audio.webm", { type: "audio/webm" });

    // Transcription
    console.log("🎙️ Transcription en cours...");
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      language: "fr",
      response_format: "text",
    });

    const transcribedText = typeof transcription === "string" ? transcription : transcription.text || "";
    console.log("✓ Transcription complète:", transcribedText.substring(0, 100) + "...");

    // Correction du texte transcrit
    console.log("🤖 Correction en cours...");
    const correctionPrompt = `Tu es un correcteur professionnel de français. Voici un texte transcrit à partir d'un enregistrement audio d'une personne qui s'exprime en français :

---TEXTE TRANSCRIT---
${transcribedText}
---FIN TEXTE TRANSCRIT---

CORRECTION :
Recris EXACTEMENT ce texte en corrigeant UNIQUEMENT :
- Corrige les fautes d orthographe
- Corrige les fautes de grammaire (accords, genres, nombres)
- Corrige les fautes de conjugaison
- Corrige les erreurs d article (le/la/les/un/une)
- Corrige la ponctuation
- Corrige les accents manquants ou incorrects

IMPORTANT :
✓ Ne rajoute AUCUN mot
✓ Ne supprime AUCUN mot  
✓ Ne change PAS le sens
✓ Ne fais AUCUN commentaire
✓ Retourne UNIQUEMENT le texte corrigé
✓ Préserve la structure du texte

TEXTE CORRIGÉ :`;

    const correctionCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: correctionPrompt,
        },
      ],
    });

    const correctionText = correctionCompletion.choices[0].message.content || null;
    console.log("✓ Correction complète");

    return NextResponse.json({
      transcribedText,
      correctionText,
    });
  } catch (error) {
    console.error("Erreur transcription/correction Groq:", error);
    return NextResponse.json({ error: "Transcription/Correction failed" }, { status: 500 });
  }
}
