import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const { summary, word1, def1, word2, def2 } = await request.json();

  try {
    // Correction du résumé
    const summaryCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Voici un texte ecrit par un apprenant :

"${summary}"

Recris EXACTEMENT ce texte en corrigeant UNIQUEMENT :
- Les fautes d orthographe
- Les fautes de grammaire
- La conjugaison
- La ponctuation

REGLES STRICTES :
- Ne change pas le sens
- Ne rajoute aucun mot
- Ne supprime aucun mot
- Ne fais aucun commentaire
- Retourne UNIQUEMENT le texte corrige`
      }]
    });

    // Vérification des mots appris
    const wordsCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Un apprenant a donne ces definitions pour deux mots :

Mot 1 : "${word1}"
Definition donnee : "${def1}"

Mot 2 : "${word2}"
Definition donnee : "${def2}"

Pour chaque mot reponds EXACTEMENT dans ce format :
MOT1_CORRECT: oui ou non
MOT1_FEEDBACK: [si non, la vraie definition courte. Si oui, ecris "Bonne definition !"]
MOT2_CORRECT: oui ou non
MOT2_FEEDBACK: [si non, la vraie definition courte. Si oui, ecris "Bonne definition !"]`
      }]
    });

    const summaryCorrected = summaryCompletion.choices[0]?.message?.content || null;
    const wordsRaw = wordsCompletion.choices[0]?.message?.content || "";

    // Parser la réponse mots
    const mot1Correct = wordsRaw.includes("MOT1_CORRECT: oui");
    const mot2Correct = wordsRaw.includes("MOT2_CORRECT: oui");
    const mot1Feedback = wordsRaw.match(/MOT1_FEEDBACK: (.+)/)?.[1] || "";
    const mot2Feedback = wordsRaw.match(/MOT2_FEEDBACK: (.+)/)?.[1] || "";

    return NextResponse.json({
      summaryCorrected,
      wordsFeedback: {
        word1: { correct: mot1Correct, feedback: mot1Feedback },
        word2: { correct: mot2Correct, feedback: mot2Feedback },
      }
    });
  } catch (error) {
    console.error("Erreur correction:", error);
    return NextResponse.json({ summaryCorrected: null, wordsFeedback: null });
  }
}