import { getRound } from "./schedule";
import type { CourtResult, Standing } from "./types";

export function parseScore(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  const score = Number(value.trim());
  return Number.isInteger(score) ? score : null;
}

export function assertDecidedScore(scoreA: number, scoreB: number) {
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    throw new Error("Scores must be whole numbers.");
  }
  if (scoreA === scoreB) throw new Error("A game cannot end in a tie.");
}

export function rankStandings(players: string[], courtCount: number, results: CourtResult[]): Standing[] {
  const rows = players.map((name, playerIndex) => ({
    playerIndex,
    name,
    points: 0,
    margin: 0,
  }));

  for (const result of results) {
    assertDecidedScore(result.scoreA, result.scoreB);
    const round = getRound(players.length, courtCount, result.gameIndex);
    const match = round.matches.find((item) => item.courtIndex === result.courtIndex);
    if (!match) throw new Error("That court is not in this game.");

    const margin = Math.abs(result.scoreA - result.scoreB);
    const winners = result.scoreA > result.scoreB ? match.sideA : match.sideB;
    const losers = result.scoreA > result.scoreB ? match.sideB : match.sideA;
    for (const player of winners) {
      rows[player].points += 1;
      rows[player].margin += margin;
    }
    for (const player of losers) rows[player].margin -= margin;
  }

  return rows.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.margin !== b.margin) return b.margin - a.margin;
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return a.playerIndex - b.playerIndex;
  });
}

export function scoredGameIndexes(results: CourtResult[]) {
  return [...new Set(results.map((result) => result.gameIndex))].sort((a, b) => a - b);
}
