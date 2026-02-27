import { NextResponse } from "next/server";

export async function GET() {
  const TOPICS = [
    "chnahiya ahsen haja 3taha lik rebi mn ghir walidik o khtek o oreo ?",
    "chnahiya 5 nasihat li kenti tebghi te3ti l rasek 9bel b 5ans",
    "is it better to speak or to die ?",
    "aktar haja ndemti 3liha ?",
    "ahsen nasi7a 3taha lik chi wahed ?",
    "3lach imane ahsen binome fl 3alam ?",
    "chno l haja li t3elemti mn EMSI (mnghir 9raya) ?",
    "3lach mawseltich l dik lhaja li kenti tat tmenaha ?",
    "bach tat hes db ?",
    "chno lhaja li tebghi tgol l mamak ?",
    "akhir mera kenti fakhour b rasek ?",
    "3lach mzl ma jerebti dik lhaja li kenti baghi dir ?",
    "chno hat koun tat dir mn hna 1ans bedebt ?",
    "chno perfect routine dialk ?",
    "fin tat chouf rasek mn hna 10ans ?",
    "awel haja tebghi t3elemha l weldek fl future ?",
    "Chkoun la personne qui t inspire le plus ?",
    "aktar haja jer7atek chi hed galha wla darha ?",
    "aktar haja zwina chi hed galha wla darha lik ?",
    "3lach tat bghi real madrid ?",
    "3lach messi hsen mn ronaldo ?",
    "lhaja li tat khelik ferhan ?",
    "ila 9derti tbedel f had l3alam haja wehda , chno hat koun ?",
    "chno houwa l holm dialk ?",
  ];

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  return NextResponse.json({ topic });
}