import { NextResponse } from "next/server";

const TOPICS = [
  "Decris ta ville ideale",
  "Quel est ton plus grand reve ?",
  "Parle d un souvenir d enfance marquant",
  "Que ferais-tu avec un million d euros ?",
  "Decris la personne qui t inspire le plus",
  "Quel metier aurais-tu aime exercer ?",
  "Parle d un livre ou film qui t a transforme",
  "Decris ton endroit prefere dans le monde",
  "Quelle competence aimerais-tu maitriser ?",
  "Parle d un defi que tu as surmonte",
  "Decris ta routine matinale ideale",
];

export async function GET() {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  return NextResponse.json({ topic });
}