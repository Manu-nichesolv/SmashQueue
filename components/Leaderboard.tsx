import { rankStandings } from "@/lib/standings";
import type { Session } from "@/lib/types";
import { motionStyle } from "./motion";

export function Leaderboard({ session, onNewSession }: { session: Session; onNewSession: () => void }) {
  const board = rankStandings(session.players, session.courtLabels.length, session.results);
  const currentSaved = session.results.some((result) => result.gameIndex === session.gameIndex);

  return (
    <>
      <p className="eyebrow">Session over</p>
      <h1>Leaderboard</h1>
      <p className="lede">Points from every scored game. This board stays with this session only.</p>
      {!currentSaved && (
        <p className="hint">Game {session.gameIndex + 1} was not counted.</p>
      )}
      <ol className="board">
        {board.map((row, index) => (
          <li
            className={`board-row animate__animated animate__fadeInUp${index === 0 ? " first" : ""}`}
            style={motionStyle(index * 0.06)}
            key={row.playerIndex}
          >
            <span
              className={index === 0 ? "place animate__animated animate__pulse" : "place"}
              style={index === 0 ? motionStyle(0.25) : undefined}
            >
              {index + 1}
            </span>
            <span className="who">
              <strong>{row.name}</strong>
              <small>Player {row.playerIndex + 1}</small>
            </span>
            <span className="pts">
              {row.points}
              <small>{row.points === 1 ? "pt" : "pts"}</small>
            </span>
            <span className="margin">{formatMargin(row.margin)}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="button primary" onClick={onNewSession}>
        New session
      </button>
    </>
  );
}

function formatMargin(margin: number) {
  if (margin > 0) return `+${margin}`;
  return String(margin);
}
