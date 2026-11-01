"use client";

import { freshSession, useSession } from "@/lib/storage";
import type { Sport } from "@/lib/types";
import { CourtView } from "./CourtView";
import { Leaderboard } from "./Leaderboard";
import { SetupForm } from "./SetupForm";
import { HomeScreen, SportPicker } from "./Welcome";

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
    setSession({ ...session, phase: "setup", sport });
  }

  const centered = session.phase === "home" || session.phase === "sport";
  const shellClass = session.phase === "play" ? "shell playing" : centered ? "shell home-shell" : "shell";

  return (
    <main className={shellClass}>
      {session.phase === "home" && <HomeScreen onPlay={() => setSession({ ...session, phase: "sport" })} />}
      {session.phase === "sport" && (
        <SportPicker onChoose={chooseSport} onBack={() => setSession({ ...session, phase: "home" })} />
      )}
      {session.phase === "setup" && (
        <SetupForm
          session={session}
          onChange={setSession}
          onStart={start}
          onBack={() => setSession({ ...session, phase: "sport" })}
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
