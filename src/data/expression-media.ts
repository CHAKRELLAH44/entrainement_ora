// Vidéos YouTube pour la fonctionnalité Exprimer
export interface ExpressionMedia {
  id: string;
  type: "video" | "image";
  title: string;
  url: string; // URL YouTube ou chemin local pour les images
  thumbnail?: string;
}

export const expressionMediaList: ExpressionMedia[] = [
  {
    id: "video-1",
    type: "video",
    title: "Vidéo d'inspiration 1",
    url: "https://youtu.be/e9dZQelULDk?si=MWhAvLr-V7fRMI9l",
    thumbnail: "https://img.youtube.com/vi/e9dZQelULDk/maxresdefault.jpg",
  },
  {
    id: "video-2",
    type: "video",
    title: "Vidéo d'inspiration 2",
    url: "https://youtu.be/p7LDk4D3Q3U?si=HnEqdL8vHZHnKzce",
    thumbnail: "https://img.youtube.com/vi/p7LDk4D3Q3U/maxresdefault.jpg",
  },
  {
    id: "video-3",
    type: "video",
    title: "Vidéo d'inspiration 3",
    url: "https://youtu.be/WMMTls5WSO4?si=2bgFh2Vt4GkHlQMv",
    thumbnail: "https://img.youtube.com/vi/WMMTls5WSO4/maxresdefault.jpg",
  },
  {
    id: "video-4",
    type: "video",
    title: "Vidéo d'inspiration 4",
    url: "https://youtu.be/BqSxjmvXzzY?si=vPzLkPsX7WLf165Z",
    thumbnail: "https://img.youtube.com/vi/BqSxjmvXzzY/maxresdefault.jpg",
  },
  {
    id: "image-1",
    type: "image",
    title: "Image d'inspiration 1",
    url: "/expression-images/image-1.jpg",
  },
  {
    id: "image-2",
    type: "image",
    title: "Image d'inspiration 2",
    url: "/expression-images/image-2.jpg",
  },
  {
    id: "image-3",
    type: "image",
    title: "Image d'inspiration 3",
    url: "/expression-images/image-3.jpg",
  },
  {
    id: "image-4",
    type: "image",
    title: "Image d'inspiration 4",
    url: "/expression-images/image-4.jpg",
  },
  {
    id: "image-5",
    type: "image",
    title: "Image d'inspiration 5",
    url: "/expression-images/image-5.jpg",
  },
  {
    id: "image-6",
    type: "image",
    title: "Image d'inspiration 6",
    url: "/expression-images/image-6.jpg",
  },
  {
    id: "image-7",
    type: "image",
    title: "Image d'inspiration 7",
    url: "/expression-images/image-7.jpg",
  },
  {
    id: "image-8",
    type: "image",
    title: "Image d'inspiration 8",
    url: "/expression-images/image-8.jpg",
  },
  {
    id: "image-9",
    type: "image",
    title: "Image d'inspiration 9",
    url: "/expression-images/image-9.jpg",
  },
];

// Fonction pour obtenir un média aléatoire
export function getRandomMedia(): ExpressionMedia {
  return expressionMediaList[Math.floor(Math.random() * expressionMediaList.length)];
}
