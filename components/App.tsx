"use client";

import { freshSession, useSession } from "@/lib/storage";
import { MAX_PLAYERS, playersPerCourt, type Format, type Sport } from "@/lib/types";
import { CourtView } from "./CourtView";
import { Leaderboard } from "./Leaderboard";
import { SetupForm } from "./SetupForm";
import { CoverArt, FormatPicker, HomeScreen, SportPicker } from "./Welcome";

export function App() {
  const [session, setSession] = useSession();

  function start() {
    setSession({
      ...session,
      phase: "play",
      players: session.players.map((name) => name.trim()),
      courtLabels: session.courtLabels.map((label, index) => label.trim() || `Court ${index + 1}`),
      gameIndex: 0,
      results: [],
    });
  }

  function chooseSport(sport: Sport) {
    setSession({ ...session, phase: "format", sport });
  }

  function chooseFormat(format: Format) {
    const minimum = playersPerCourt(format);
    const named = session.players.some((name) => name.trim());
    let players = [...session.players];
    if (!named) players = format === "singles" ? ["", "", ""] : ["", "", "", "", ""];
    while (players.length < minimum) players.push("");
    if (players.length > MAX_PLAYERS) players = players.slice(0, MAX_PLAYERS);
    setSession({ ...session, phase: "setup", format, players });
  }

  const centered = session.phase === "home" || session.phase === "sport" || session.phase === "format";
  const shellClass = session.phase === "play" ? "shell playing" : centered ? "shell home-shell" : "shell";

  return (
    <main className={shellClass}>
      {centered && <CoverArt />}
      {session.phase === "home" && <HomeScreen onPlay={() => setSession({ ...session, phase: "sport" })} />}
      {session.phase === "sport" && (
        <SportPicker onChoose={chooseSport} onBack={() => setSession({ ...session, phase: "home" })} />
      )}
      {session.phase === "format" && (
        <FormatPicker onChoose={chooseFormat} onBack={() => setSession({ ...session, phase: "sport" })} />
      )}
      {session.phase === "setup" && (
        <SetupForm
          session={session}
          onChange={setSession}
          onStart={start}
          onBack={() => setSession({ ...session, phase: "format" })}
        />
      )}
      {session.phase === "play" && (
        <CourtView
          session={session}
          onSession={setSession}
          onEnd={() => setSession({ ...session, phase: "leaderboard" })}
          onReset={() => setSession(freshSession(session))}
        />
      )}
      {session.phase === "leaderboard" && (
        <Leaderboard session={session} onNewSession={() => setSession(freshSession(session))} />
      )}
    </main>
  );
}
