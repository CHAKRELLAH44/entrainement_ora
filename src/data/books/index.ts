import { Book } from "@/types/books";
import { lePetitPrince } from "./le-petit-prince";
import { alchimiste } from "./alchimiste";

export const BOOKS: Book[] = [
  lePetitPrince,
    alchimiste,
  // Ajoutez d'autres livres ici
];

export function getBookById(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}