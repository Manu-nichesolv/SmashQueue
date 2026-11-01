"use client";

import { useState } from "react";
import { getRound } from "@/lib/schedule";
import { parseScore } from "@/lib/standings";
import type { CourtMatch, CourtResult, Session } from "@/lib/types";
import { sportLabel } from "@/lib/types";
import { Fairness } from "./Fairness";
import { motionStyle } from "./motion";
import { PlayerChip } from "./PlayerChip";

export function CourtView({
  session,
  onSession,
  onEnd,
  onReset,
}: {
  session: Session;
  onSession: (session: Session) => void;
  onEnd: () => void;
  onReset: () => void;
}) {
  const courtCount = session.courtLabels.length;
  const round = getRound(session.players.length, courtCount, session.gameIndex, session.format ?? "doubles");

  return (
    <CourtGame
      key={session.gameIndex}
      session={session}
      round={round}
      onSession={onSession}
      onEnd={onEnd}
      onReset={onReset}
    />
  );
}

function CourtGame({
  session,
  round,
  onSession,
  onEnd,
  onReset,
}: {
  session: Session;
  round: ReturnType<typeof getRound>;
  onSession: (session: Session) => void;
  onEnd: () => void;
  onReset: () => void;
}) {
  const courtCount = session.courtLabels.length;
  const [draft, setDraft] = useState(() => hydrate(session.results, session.gameIndex, courtCount));

  const parsed = round.matches.map((_, courtIndex) => ({
    a: parseScore(draft[courtIndex]?.a ?? ""),
    b: parseScore(draft[courtIndex]?.b ?? ""),
  }));
  const hasTie = parsed.some((score) => score.a !== null && score.b !== null && score.a === score.b);
  const canAdvance = parsed.every((score) => score.a !== null && score.b !== null && score.a !== score.b);

  function setScore(courtIndex: number, side: "a" | "b", value: string) {
    setDraft((current) => ({
      ...current,
      [courtIndex]: { ...current[courtIndex], [side]: value },
    }));
  }

  function advance() {
    if (!canAdvance) return;
    const kept = session.results.filter((result) => result.gameIndex !== session.gameIndex);
    const saved: CourtResult[] = parsed.map((score, courtIndex) => ({
      gameIndex: session.gameIndex,
      courtIndex,
      scoreA: score.a as number,
      scoreB: score.b as number,
    }));
    onSession({ ...session, results: [...kept, ...saved], gameIndex: session.gameIndex + 1 });
  }

  return (
    <>
      <header className="top">
        <div>
          <p className="eyebrow">
            {session.sport ? sportLabel(session.sport) : "SmashQueue"}
            {" · "}
            {session.format === "singles" ? "Singles" : "Doubles"}
          </p>
          <h1>Game {session.gameIndex + 1}</h1>
        </div>
      </header>
      <div className="inline-actions">
        <button type="button" className="ghost" onClick={onReset}>
          Reset
        </button>
        <button type="button" className="ghost" onClick={onEnd}>
          End session
        </button>
      </div>

      <div>
        {round.matches.map((match, matchIndex) => (
          <article
            className="card court-card animate__animated animate__fadeInUp"
            style={motionStyle(matchIndex * 0.08)}
            key={match.courtIndex}
          >
            <h2 className="court-label">{session.courtLabels[match.courtIndex]}</h2>
            <div className="court">
              <div className="side">
                {match.sideA.map((player, chipIndex) => (
                  <PlayerChip
                    key={player}
                    index={player}
                    name={session.players[player]}
                    delay={matchIndex * 0.08 + 0.05 + chipIndex * 0.05}
                  />
                ))}
              </div>
              <div />
              <div className="side">
                {match.sideB.map((player, chipIndex) => (
                  <PlayerChip
                    key={player}
                    index={player}
                    name={session.players[player]}
                    delay={matchIndex * 0.08 + 0.15 + chipIndex * 0.05}
                  />
                ))}
              </div>
            </div>
            <div className="score">
              <label>
                <span>{sideLabel(match.sideA, session.players)}</span>
                <input
                  inputMode="numeric"
                  aria-label={`${session.courtLabels[match.courtIndex]} score for ${sideLabel(match.sideA, session.players)}`}
                  value={draft[match.courtIndex]?.a ?? ""}
                  onChange={(event) => setScore(match.courtIndex, "a", event.target.value)}
                />
              </label>
              <span className="vs">vs</span>
              <label>
                <span>{sideLabel(match.sideB, session.players)}</span>
                <input
                  inputMode="numeric"
                  aria-label={`${session.courtLabels[match.courtIndex]} score for ${sideLabel(match.sideB, session.players)}`}
                  value={draft[match.courtIndex]?.b ?? ""}
                  onChange={(event) => setScore(match.courtIndex, "b", event.target.value)}
                />
              </label>
            </div>
            <p className="hint">{matchNote(match, session.players, session.format ?? "doubles")}</p>
          </article>
        ))}

        {round.sitting.length > 0 && (
          <section>
            <h2 className="bench-title">Sitting</h2>
            <div className="bench-row">
              {round.sitting.map((player, index) => (
                <PlayerChip
                  key={player}
                  index={player}
                  name={session.players[player]}
                  delay={0.12 + index * 0.05}
                  bench
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Fairness
        players={session.players}
        courtCount={courtCount}
        results={session.results}
        format={session.format ?? "doubles"}
      />
      {hasTie && <p className="error">A game cannot end in a tie.</p>}

      <div className="dock">
        <button
          type="button"
          className="button secondary"
          disabled={session.gameIndex === 0}
          onClick={() => onSession({ ...session, gameIndex: session.gameIndex - 1 })}
        >
          Previous
        </button>
        <button type="button" className="button primary" disabled={!canAdvance} onClick={advance}>
          Next game
        </button>
      </div>
    </>
  );
}

function hydrate(results: CourtResult[], gameIndex: number, courtCount: number) {
  const draft: Record<number, { a: string; b: string }> = {};
  for (let courtIndex = 0; courtIndex < courtCount; courtIndex += 1) {
    const saved = results.find((result) => result.gameIndex === gameIndex && result.courtIndex === courtIndex);
    draft[courtIndex] = saved ? { a: String(saved.scoreA), b: String(saved.scoreB) } : { a: "", b: "" };
  }
  return draft;
}

function sideLabel(side: number[], players: string[]) {
  return side.map((player) => players[player]).join(" & ");
}

function matchNote(match: CourtMatch, players: string[], format: "singles" | "doubles") {
  if (format === "singles") {
    const names = `${players[match.sideA[0]]} and ${players[match.sideB[0]]}`;
    return match.repeatMatch ? `${names} have played before.` : `${names} are a new match.`;
  }
  return (
    match.pairs
      .map((pair) => {
        const names = `${players[pair.players[0]]} & ${players[pair.players[1]]}`;
        return pair.repeat ? `${names} have paired before` : `${names} are a new pair`;
      })
      .join(". ") + "."
  );
}
