import { Direction } from "./geography";

export interface Guess {
  fromName: string;
  toName: string;
  fromDistance: number;
  toDistance: number;
  fromDirection: Direction;
  toDirection: Direction;
}

export function loadAllGuesses(): Record<string, Guess[]> {
  return {};
}

export function saveGuesses(dayString: string, guesses: Guess[]): void {
  const allGuesses = loadAllGuesses();
  localStorage.setItem(
    "guesses",
    JSON.stringify({
      ...allGuesses,
      [dayString]: guesses,
    })
  );
}
