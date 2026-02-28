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

    console.log("Audio type:", audioFile.type);
    console.log("Audio size:", audioFile.size);

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Groq supporte ces formats : mp3, mp4, mpeg, mpga, m4a, wav, webm
    // On force le nom en .webm qui est supporte
    const blob = new Blob([buffer], { type: "audio/webm" });
    const file = new File([blob], "audio.webm", { type: "audio/webm" });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      language: "fr",
      response_format: "text",
    });

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Erreur transcription Groq:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}