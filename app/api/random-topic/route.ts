import { NextResponse } from "next/server";
import { getRandomTopic } from "@/lib/topics";
import { Lang } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get("lang") || "fr") as Lang;
  return NextResponse.json({ topic: getRandomTopic(lang) });
}