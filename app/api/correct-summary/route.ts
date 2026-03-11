import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const { summary, word1, def1, word2, def2 } = await request.json();

  try {
    console.log("\n📚 CORRECTION DE RESUME DE LECTURE");
    console.log("Résumé original (", summary.length, "caractères)");
    
    // Correction du résumé
    const summaryCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0.1,
      messages: [{
        role: "user",
        content: `Tu es un correcteur professionnel de français. Voici un résumé écrit par un apprenant :

---RESUME ORIGINAL---
${summary}
---FIN RESUME---

CORRECTION :
Recris EXACTEMENT ce résumé en corrigeant UNIQUEMENT :
1. Les fautes d'orthographe
2. Les fautes de grammaire
3. La conjugaison
4. La ponctuation

IMPORTANT :
✓ Ne rajoute AUCUN mot
✓ Ne supprime AUCUN mot
✓ Ne change PAS le sens
✓ Conserve la longueur du texte
✓ Retourne UNIQUEMENT le résumé corrigé

RESUME CORRIGE :`
      }]
    });

    const summaryCorrected = summaryCompletion.choices[0]?.message?.content?.trim() || null;
    console.log("✅ Résumé corrigé (", summaryCorrected?.length || 0, "caractères)");
    
    if (!summaryCorrected) {
      console.error("⚠️ La correction du résumé a échoué!");
    }
    
    // Vérification des mots appris
    console.log("📝 Vérification des mots: '", word1, "' et '", word2, "'");
    
    const wordsCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      temperature: 0.1,
      messages: [{
        role: "user",
        content: `Tu es un expert en vocabulaire français. Un apprenant a donné ces définitions :

MOT 1: "${word1}"
DÉFINITION DONNÉE: "${def1}"

MOT 2: "${word2}"
DÉFINITION DONNÉE: "${def2}"

Vérifie chaque définition. Réponds EXACTEMENT dans ce format :
MOT1_CORRECT: oui ou non
MOT1_FEEDBACK: [Si correct, écris "Bonne définition!". Sinon, donne la vraie définition courte.]
MOT2_CORRECT: oui ou non
MOT2_FEEDBACK: [Si correct, écris "Bonne définition!". Sinon, donne la vraie définition courte.]`
      }]
    });

    const wordsRaw = wordsCompletion.choices[0]?.message?.content || "";
    console.log("✅ Vérification des mots reçue");

    // Parser la réponse mots
    const mot1Correct = wordsRaw.includes("MOT1_CORRECT: oui");
    const mot2Correct = wordsRaw.includes("MOT2_CORRECT: oui");
    const mot1Feedback = wordsRaw.match(/MOT1_FEEDBACK:\s*(.+?)(?:\n|MOT2|$)/)?.[1]?.trim() || "Erreur lors de la vérification";
    const mot2Feedback = wordsRaw.match(/MOT2_FEEDBACK:\s*(.+?)(?:\n|$)/)?.[1]?.trim() || "Erreur lors de la vérification";

    console.log("Mot 1:", mot1Correct ? "✅ Correct" : "❌ À revoir");
    console.log("Mot 2:", mot2Correct ? "✅ Correct" : "❌ À revoir");

    return NextResponse.json({
      summaryCorrected: summaryCorrected || summary,
      wordsFeedback: {
        word1: { correct: mot1Correct, feedback: mot1Feedback },
        word2: { correct: mot2Correct, feedback: mot2Feedback },
      }
    });
  } catch (error) {
    console.error("❌ Erreur correction:", error);
    return NextResponse.json({ summaryCorrected: summary, wordsFeedback: null });
  }
}