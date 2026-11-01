import { participationFromGames } from "@/lib/schedule";
import { rankStandings, scoredGameIndexes } from "@/lib/standings";
import type { CourtResult } from "@/lib/types";

export function Fairness({
  players,
  courtCount,
  results,
}: {
  players: string[];
  courtCount: number;
  results: CourtResult[];
}) {
  const standings = rankStandings(players, courtCount, results);
  const points = new Map(standings.map((row) => [row.playerIndex, row.points]));
  const { played, sat } = participationFromGames(players.length, courtCount, scoredGameIndexes(results));

  return (
    <section>
      <h2 className="section-title">Fairness</h2>
      <div className="fairness">
        {players.map((name, index) => (
          <article className="fair-card" key={name + index}>
            <strong>{name}</strong>
            <span>
              {played[index]} played · {sat[index]} sat · {points.get(index) ?? 0} pts
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
