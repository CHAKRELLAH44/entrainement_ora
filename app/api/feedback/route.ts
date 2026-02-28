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

  const prompt = `Voici un texte oral transcrit automatiquement :

"${transcription}"

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
- Ne rajoute aucune explication
- Retourne UNIQUEMENT le texte corrige, rien d autre`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const feedback = completion.choices[0]?.message?.content || null;
    console.log("Feedback generated:", feedback);
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Erreur Groq feedback:", error);
    return NextResponse.json({ feedback: null });
  }
}