export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;
export const MIN_COURTS = 1;
export const MAX_COURTS = 4;

export type CourtResult = {
  gameIndex: number;
  courtIndex: number;
  scoreA: number;
  scoreB: number;
};

export const SPORTS = [
  { id: "badminton", label: "Badminton" },
  { id: "pickleball", label: "Pickleball" },
  { id: "table-tennis", label: "Table tennis" },
] as const;

export type Sport = (typeof SPORTS)[number]["id"];

export type Phase = "home" | "sport" | "setup" | "play" | "leaderboard";

export function sportLabel(sport: Sport) {
  return SPORTS.find((item) => item.id === sport)?.label ?? "Badminton";
}

export type Session = {
  phase: Phase;
  sport: Sport | null;
  courtLabels: string[];
  players: string[];
  gameIndex: number;
  results: CourtResult[];
};

export type Pairing = {
  players: [number, number];
  repeat: boolean;
};

export type CourtMatch = {
  courtIndex: number;
  sideA: [number, number];
  sideB: [number, number];
  pairs: [Pairing, Pairing];
};

export type Round = {
  gameIndex: number;
  sitting: number[];
  matches: CourtMatch[];
};

export type Standing = {
  playerIndex: number;
  name: string;
  points: number;
  margin: number;
};
