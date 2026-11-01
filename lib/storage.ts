import { useSyncExternalStore } from "react";
import type { CourtResult, Phase, Session, Sport } from "./types";
import { MAX_COURTS, MAX_PLAYERS, MIN_COURTS, MIN_PLAYERS, SPORTS } from "./types";

export const STORAGE_KEY = "smashqueue-session";

export function initialSession(): Session {
  return {
    phase: "home",
    sport: null,
    courtLabels: ["Court 1"],
    players: ["", "", "", "", ""],
    gameIndex: 0,
    results: [],
  };
}

const listeners = new Set<() => void>();
let current: Session | null = null;
const serverSession = initialSession();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!current) current = loadSession() ?? serverSession;
  return current;
}

export function updateSession(session: Session) {
  current = session;
  saveSession(session);
  for (const listener of listeners) listener();
}

function getServerSnapshot() {
  return serverSession;
}

export function useSession() {
  return [useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), updateSession] as const;
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function freshSession(session: Session): Session {
  return {
    phase: "home",
    sport: null,
    courtLabels: session.courtLabels,
    players: session.players,
    gameIndex: 0,
    results: [],
  };
}

function parseSession(value: unknown): Session | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<Session>;
  if (!isPhase(record.phase)) return null;
  if (!Array.isArray(record.players) || !Array.isArray(record.courtLabels)) return null;
  if (!record.players.every((player) => typeof player === "string")) return null;
  if (!record.courtLabels.every((label) => typeof label === "string")) return null;
  if (
    record.players.length < MIN_PLAYERS ||
    record.players.length > MAX_PLAYERS ||
    record.courtLabels.length < MIN_COURTS ||
    record.courtLabels.length > MAX_COURTS
  ) {
    return null;
  }
  if (typeof record.gameIndex !== "number" || record.gameIndex < 0) return null;
  if (!Array.isArray(record.results) || !record.results.every(isResult)) return null;
  const sport = isSport(record.sport) ? record.sport : null;
  let phase = record.phase;
  if ((phase === "setup" || phase === "sport" || phase === "play" || phase === "leaderboard") && !sport) {
    phase = phase === "play" || phase === "leaderboard" ? phase : "home";
  }
  return {
    phase,
    sport: sport ?? (phase === "play" || phase === "leaderboard" ? "badminton" : null),
    courtLabels: record.courtLabels,
    players: record.players,
    gameIndex: record.gameIndex,
    results: record.results,
  };
}

function isPhase(value: unknown): value is Phase {
  return value === "home" || value === "sport" || value === "setup" || value === "play" || value === "leaderboard";
}

function isSport(value: unknown): value is Sport {
  return SPORTS.some((sport) => sport.id === value);
}

function isResult(value: unknown): value is CourtResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<CourtResult>;
  return (
    typeof result.gameIndex === "number" &&
    typeof result.courtIndex === "number" &&
    typeof result.scoreA === "number" &&
    typeof result.scoreB === "number"
  );
}
