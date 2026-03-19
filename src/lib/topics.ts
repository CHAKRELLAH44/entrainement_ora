import { Lang } from "./i18n";
import { Theme, getUserThemes } from "./themes-storage";

// ─── FRANÇAIS ───────────────────────────────────────────
const TOPICS_FR: Record<Theme, string[]> = {
  tech: [
    "Penses-tu que l intelligence artificielle va remplacer les humains dans le travail ?",
    "Est-ce que les reseaux sociaux font plus de mal que de bien ?",
    "Si tu pouvais inventer une application, ca serait quoi ?",
    "Est-ce que tu penses que les smartphones nous rendent moins intelligents ?",
    "Les jeux video sont-ils une perte de temps ou un vrai apprentissage ?",
    "Que penses-tu de la voiture electrique ?",
    "Est-ce que la technologie nous isole ou nous rapproche ?",
  ],
  sport: [
    "Quel est le sport qui t a le plus marque et pourquoi ?",
    "Penses-tu que le sport de haut niveau est sain pour le corps ?",
    "Si tu pouvais pratiquer n importe quel sport, lequel choisirais-tu ?",
    "Le sport peut-il changer une vie ? Donne un exemple.",
    "Quel est selon toi le sportif le plus inspire de tous les temps ?",
    "Est-ce que le foot est trop dominant dans le monde du sport ?",
    "Penses-tu que le sport devrait etre obligatoire a l ecole ?",
  ],
  philosophie: [
    "Est-il mieux de parler ou de mourir ?",
    "Qu est-ce que le bonheur pour toi ?",
    "Penses-tu que l homme est naturellement bon ou mauvais ?",
    "La liberte totale est-elle possible dans une societe ?",
    "Est-ce que l echec est necessaire pour reussir ?",
    "Que vaut-il mieux : une longue vie ordinaire ou une courte vie intense ?",
    "Peut-on etre heureux sans argent ?",
    "Est-ce que l argent fait le bonheur ?",
    "Est-ce que l argent signifie la liberte ?",
    "Est-ce qu il faut toujours etre honnete a 100% dans toutes les situations, ou l honnetete a ses limites ?",
    "Est-ce que les gagnants prennent vraiment tout ?",
    "C est quoi la chose que tu fais semblant de ne pas savoir sur toi-meme ?",
    "Si tu savais que personne ne te jugerait, qu est-ce que tu ferais differemment demain ?",
    "Est-ce que tu crois que tu merites ce que tu as ? Sois honnete.",
    "Est-ce que tu es fier de ce que tu es devenu aujourd hui ? Sois honnete.",
  ],
  societe: [
    "Quel est selon toi le plus grand probleme du monde aujourd hui ?",
    "Est-ce que l egalite hommes-femmes est vraiment atteinte ?",
    "Penses-tu que les politiciens travaillent vraiment pour le peuple ?",
    "La peine de mort est-elle justifiee ?",
    "Est-ce que la mondialisation est une bonne chose ?",
    "Comment vois-tu le monde dans 10 ans ?",
    "Penses-tu que les medias nous manipulent ?",
    "C est quoi l injustice que tu vois chaque jour mais contre laquelle tu ne fais rien ?",
    "La chose que tu vas changer dans le monde, si tu avais le pouvoir de la faire ?",
    "Est-ce que le regard et le point de vue des gens comptent vraiment pour toi, ou tu fais juste semblant de t en ficher ?",
  ],
  amour: [
    "La plus belle chose que Dieu t a donnee dans la vie a part ta famille ?",
    "Penses-tu qu il existe une seule personne faite pour nous ?",
    "Qu est-ce qui est plus important dans une relation : l amour ou le respect ?",
    "C est quoi la chose que t as toujours voulu dire a ta mere ?",
    "Si tu pouvais entendre une seule personne te dire je suis fier de toi, ce serait qui et pourquoi cette personne-la ?",
    "C est quoi la toute premiere chose pour laquelle tu vas eduquer ton enfant dans le futur ?",
  ],
  culture: [
    "Quel est le film qui t a le plus marque et pourquoi ?",
    "Si tu pouvais vivre dans n importe quelle epoque, laquelle choisirais-tu ?",
    "Quelle est la difference entre culture et tradition ?",
    "Est-ce que la langue maternelle influence notre facon de penser ?",
    "Quel artiste ou musicien t a le plus inspire ?",
    "Est-ce que l art peut changer le monde ?",
    "Quels sont les 5 conseils que tu aurais voulu te donner il y a 5 ans ?",
    "Quel est ton reve dans la vie ?",
    "Qu est-ce que tu as oublie ou qu est-ce que tu voudrais oublier ?",
    "Si tu n avais qu une seule journee pour faire quelque chose, que ferais-tu ?",
    "Y a-t-il quelque chose dont tu as peur et pourquoi ?",
    "Si tu avais un super pouvoir, lequel choisirais-tu ?",
    "Quelle est la lecon la plus importante que tu as apprise dans ta vie ?",
    "Qu est-ce que tu voudrais changer en toi ?",
    "Qu est-ce qui te donne la motivation de continuer ?",
    "Si tu avais la chance de parler avec un personnage historique, qui serait-il ?",
    "Quel est le reve que tu voudrais realiser dans 5 ans ?",
    "A quoi penses-tu le plus souvent ?",
    "Qu est-ce que tu voudrais que tout le monde sache ?",
    "Si tu pouvais voyager dans n importe quel pays, lequel choisirais-tu ?",
    "Qu est-ce qui t a donne un peu de courage dans ta vie ?",
    "Quel est l evenement que tu n oublieras jamais dans ta vie ?",
    "Qu est-ce que tu voudrais apprendre pour ameliorer ta vie ?",
    "Si tu avais un message a ecrire a toi-meme il y a 10 ans, que dirais-tu ?",
    "Qu est-ce qui te rend unique ?",
    "Qu est ce que tu ressens en ce moment ?",
    "Qu est ce que tu aimes chez toi ?",
    "La chose que tu voudrais changer en toi ?",
    "Qu est ce que tu as appris de plus important dans ta vie ?",
    "C est quoi la version de toi que tu caches aux autres ?",
    "C est quoi le sacrifice que tu as fait et que personne n a remarque ?",
    "Si tu te reveilles demain millionnaire, c est quoi ton premier move ?",
    "Si tu mourais demain, c est quoi le truc que tu n aurais pas eu le temps de dire ?",
    "C est quoi la derniere fois ou tu as ete vraiment heureux et pourquoi ca ne dure pas ?",
    "Est-ce que tu es fier de ce que tu es devenu aujourd hui ?",
  ],
};

// ─── ANGLAIS ────────────────────────────────────────────
const TOPICS_EN: Record<Theme, string[]> = {
  tech: [
    "Do you think artificial intelligence will replace humans at work?",
    "Are social media doing more harm than good?",
    "If you could invent an app, what would it be?",
    "Do smartphones make us less intelligent?",
    "Are video games a waste of time or a real learning tool?",
    "What do you think about electric cars?",
    "Does technology isolate us or bring us closer together?",
  ],
  sport: [
    "What sport has marked you the most and why?",
    "Do you think high-level sport is healthy for the body?",
    "If you could practice any sport, which would you choose?",
    "Can sport change a life? Give an example.",
    "Who is in your opinion the most inspiring athlete of all time?",
    "Is football too dominant in the world of sport?",
    "Should sport be mandatory at school?",
  ],
  philosophie: [
    "Is it better to speak or to die?",
    "What does happiness mean to you?",
    "Do you think humans are naturally good or evil?",
    "Is total freedom possible in a society?",
    "Is failure necessary for success?",
    "Which is better: a long ordinary life or a short intense one?",
    "Can you be happy without money?",
  ],
  societe: [
    "What is in your opinion the biggest problem in the world today?",
    "Is gender equality truly achieved?",
    "Do you think politicians really work for the people?",
    "Is the death penalty justified?",
    "Is globalization a good thing?",
    "How do you see the world in 50 years?",
    "Do you think the media manipulates us?",
  ],
  amour: [
    "Do you think there is only one person made for us?",
    "What is more important in a relationship: love or respect?",

    "What does true love mean to you?",
    "Can you love someone without trusting them?",
  ],
  culture: [
    "What is the film that marked you the most and why?",
    "If you could live in any era, which would you choose?",
    "What is the difference between culture and tradition?",
    "Does your mother tongue influence the way you think?",
    "Which artist or musician has inspired you the most?",
    "Can art change the world?",
    "What book changed your perspective on life?",
  ],
};

// ─── ESPAGNOL ────────────────────────────────────────────
const TOPICS_ES: Record<Theme, string[]> = {
  tech: [
    "Crees que la inteligencia artificial reemplazara a los humanos en el trabajo?",
    "Las redes sociales hacen mas dano que bien?",
    "Si pudieras inventar una aplicacion, cual seria?",
    "Los smartphones nos hacen menos inteligentes?",
    "Los videojuegos son una perdida de tiempo o un aprendizaje real?",
    "Que piensas sobre los coches electricos?",
    "La tecnologia nos aisla o nos une?",
  ],
  sport: [
    "Cual es el deporte que mas te ha marcado y por que?",
    "Crees que el deporte de alto nivel es saludable para el cuerpo?",
    "Si pudieras practicar cualquier deporte, cual elegiras?",
    "Puede el deporte cambiar una vida? Da un ejemplo.",
    "Quien es en tu opinion el deportista mas inspirador de todos los tiempos?",
    "Es el futbol demasiado dominante en el mundo del deporte?",
    "Deberia ser el deporte obligatorio en la escuela?",
  ],
  philosophie: [
    "Es mejor hablar o morir?",
    "Que significa la felicidad para ti?",
    "Crees que los humanos son naturalmente buenos o malos?",
    "Es posible la libertad total en una sociedad?",
    "Es el fracaso necesario para el exito?",
    "Que es mejor: una vida larga ordinaria o una corta intensa?",
    "Puedes ser feliz sin dinero?",
  ],
  societe: [
    "Cual es en tu opinion el mayor problema del mundo hoy?",
    "Se ha logrado realmente la igualdad de genero?",
    "Crees que los politicos realmente trabajan para el pueblo?",
    "Esta justificada la pena de muerte?",
    "Es la globalizacion algo bueno?",
    "Como ves el mundo dentro de 50 anos?",
    "Crees que los medios de comunicacion nos manipulan?",
  ],
  amour: [
    "Crees que hay una sola persona hecha para nosotros?",
    "Que es mas importante en una relacion: el amor o el respeto?",

    "Que significa el amor verdadero para ti?",
    "Puedes amar a alguien sin confiar en el?",
  ],
  culture: [
    "Cual es la pelicula que mas te ha marcado y por que?",
    "Si pudieras vivir en cualquier epoca, cual elegiras?",
    "Cual es la diferencia entre cultura y tradicion?",
    "Tu lengua materna influye en tu forma de pensar?",
    "Que artista o musico te ha inspirado mas?",
    "Puede el arte cambiar el mundo?",
    "Que libro cambio tu perspectiva de la vida?",
  ],
};

const ALL_TOPICS = { fr: TOPICS_FR, en: TOPICS_EN, es: TOPICS_ES };

export function getRandomTopic(lang: Lang): string {
  const themes = getUserThemes();
  const topicsByLang = ALL_TOPICS[lang] || TOPICS_FR;

  // Collecter tous les sujets des themes choisis
  const available: string[] = [];
  themes.forEach((theme) => {
    const list = topicsByLang[theme];
    if (list) available.push(...list);
  });

  if (available.length === 0) {
    // Fallback : tous les sujets
    Object.values(topicsByLang).forEach((list) => available.push(...list));
  }

  return available[Math.floor(Math.random() * available.length)];
}

// Pour l ecriture (meme logique)
export function getRandomWriteTopic(): string {
  const themes = getUserThemes();
  const available: string[] = [];
  themes.forEach((theme) => {
    const list = TOPICS_FR[theme];
    if (list) available.push(...list);
  });
  if (available.length === 0) {
    Object.values(TOPICS_FR).forEach((list) => available.push(...list));
  }
  return available[Math.floor(Math.random() * available.length)];
}