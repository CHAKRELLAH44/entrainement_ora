import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const { transcription } = await request.json();

  if (!transcription || transcription.trim().length === 0) {
    return NextResponse.json({ feedback: null });
  }

  const prompt = `Tu es un correcteur professionnel de français. Voici une transcription d'une conversation orale :

---TRANSCRIPTION ORIGINALE---
${transcription}
---FIN TRANSCRIPTION---

CORRECTION :
Recris EXACTEMENT ce texte en corrigeant UNIQUEMENT :
1. Les fautes d'orthographe
2. Les fautes de grammaire
3. La conjugaison
4. La ponctuation

IMPORTANT :
✓ Ne rajoute AUCUN mot
✓ Ne supprime AUCUN mot
✓ Ne change PAS le sens
✓ Préserve le ton naturel
✓ Retourne UNIQUEMENT le texte corrigé

TEXTE CORRIGE :`;

  try {
    console.log("\n🎙️ CORRECTION DE TRANSCRIPTION ORALE");
    console.log("Transcription originale (", transcription.length, "caractères)");
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const feedback = completion.choices[0]?.message?.content?.trim() || null;
    console.log("✅ Texte corrigé (", feedback?.length || 0, "caractères)");
    
    if (!feedback || feedback.length === 0) {
      console.error("⚠️ La correction a retourné un texte vide!");
      return NextResponse.json({ feedback: transcription });
    }
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("❌ Erreur Groq feedback:", error);
    return NextResponse.json({ feedback: transcription });
  }
}