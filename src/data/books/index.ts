import { Book } from "@/types/books";
import { lePetitPrince } from "./le-petit-prince";
import { alchimiste } from "./alchimiste";
import { manuelEpictete } from "./manuel-epictete";
import { pourmoimeme } from "./pourmoimeme";
import { labelleetlabete } from "./labelleetlabete";

export const BOOKS: Book[] = [
  lePetitPrince,
    alchimiste,
    manuelEpictete,
    pourmoimeme,
    labelleetlabete,

  // Ajoutez d'autres livres ici
];

export function getBookById(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}