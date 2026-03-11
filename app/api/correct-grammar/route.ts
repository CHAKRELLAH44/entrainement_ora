import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ correctedText: null });
  }

  const prompt = `Tu es un correcteur professionnel de français. Voici un texte écrit par un apprenant :

---TEXTE ORIGINAL---
${text}
---FIN TEXTE ORIGINAL---

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

  try {
    console.log("\n📝 CORRECTION D'ÉCRITURE");
    console.log("Texte original (", text.length, "caractères)");
    
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

    const correctedText = completion.choices[0]?.message?.content?.trim() || null;
    
    console.log("✅ Texte corrigé (", correctedText?.length || 0, "caractères)");
    
    if (!correctedText || correctedText.length === 0) {
      console.error("⚠️ La correction a retourné un texte vide!");
      return NextResponse.json({ correctedText: text });
    }
    
    return NextResponse.json({ correctedText });
  } catch (error) {
    console.error("❌ Erreur Groq correction:", error);
    return NextResponse.json({ correctedText: text });
  }
}