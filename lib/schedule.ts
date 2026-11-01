import type { CourtMatch, Format, Pairing, Round } from "./types";
import { playersPerCourt } from "./types";

type Side = number[];

type BuiltMatch = {
  sideA: Side;
  sideB: Side;
};

type State = {
  games: number[];
  lastSat: number[];
  partner: number[][];
  opponent: number[][];
  courts: number[][];
};

const FIVE_CYCLE: Array<{ sit: number; a: Side; b: Side }> = [
  { sit: 4, a: [0, 1], b: [2, 3] },
  { sit: 3, a: [0, 2], b: [1, 4] },
  { sit: 2, a: [0, 4], b: [1, 3] },
  { sit: 1, a: [0, 3], b: [2, 4] },
  { sit: 0, a: [1, 2], b: [3, 4] },
];

export function assertConfig(playerCount: number, courtCount: number, format: Format = "doubles") {
  if (courtCount < 1 || playerCount < courtCount * playersPerCourt(format)) {
    throw new Error("Not enough players to fill every court.");
  }
}

export function getRound(
  playerCount: number,
  courtCount: number,
  gameIndex: number,
  format: Format = "doubles",
): Round {
  assertConfig(playerCount, courtCount, format);
  if (gameIndex < 0 || !Number.isInteger(gameIndex)) {
    throw new Error("Game index must be a whole number.");
  }

  const state = createState(playerCount, courtCount);
  let round: Round | null = null;
  for (let game = 0; game <= gameIndex; game += 1) {
    round = compose(playerCount, courtCount, game, format, state);
    if (game < gameIndex) apply(state, round, game);
  }
  return round as Round;
}

export function participationFromGames(
  playerCount: number,
  courtCount: number,
  gameIndexes: number[],
  format: Format = "doubles",
) {
  const played = Array(playerCount).fill(0);
  const sat = Array(playerCount).fill(0);
  for (const gameIndex of gameIndexes) {
    const round = getRound(playerCount, courtCount, gameIndex, format);
    for (const sitter of round.sitting) sat[sitter] += 1;
    for (const match of round.matches) {
      for (const player of [...match.sideA, ...match.sideB]) played[player] += 1;
    }
  }
  return { played, sat };
}

function compose(
  playerCount: number,
  courtCount: number,
  gameIndex: number,
  format: Format,
  state: State,
): Round {
  const built =
    format === "doubles" && playerCount === 5 && courtCount === 1
      ? fivePlayerMatch(gameIndex)
      : balancedRound(playerCount, courtCount, gameIndex, format, state);

  const matches: CourtMatch[] = built.matches.map((match, courtIndex) => ({
    courtIndex,
    sideA: match.sideA,
    sideB: match.sideB,
    pairs: format === "doubles" ? [pairing(match.sideA, state), pairing(match.sideB, state)] : [],
    repeatMatch: state.opponent[match.sideA[0]][match.sideB[0]] > 0,
  }));

  return { gameIndex, sitting: built.sitting, matches };
}

function fivePlayerMatch(gameIndex: number): { sitting: number[]; matches: BuiltMatch[] } {
  const slot = FIVE_CYCLE[gameIndex % 5];
  const swap = Math.floor(gameIndex / 5) % 2 === 1;
  const sideA = swap ? slot.b : slot.a;
  const sideB = swap ? slot.a : slot.b;
  return {
    sitting: [slot.sit],
    matches: [{ sideA: ordered(sideA), sideB: ordered(sideB) }],
  };
}

function balancedRound(
  playerCount: number,
  courtCount: number,
  gameIndex: number,
  format: Format,
  state: State,
): { sitting: number[]; matches: BuiltMatch[] } {
  const onCourt = playersPerCourt(format);
  const sitting = chooseSitters(playerCount, playerCount - courtCount * onCourt, gameIndex, state);
  const playing = Array.from({ length: playerCount }, (_, index) => index).filter(
    (index) => !sitting.includes(index),
  );
  const matches = assignCourts(
    format === "singles"
      ? singlesMatches(playing, state)
      : playing.length === 4
        ? [bestSplit(playing, state)]
        : groupPairs(pairPlayers(playing, state), state),
    courtCount,
    state,
  );
  return { sitting, matches };
}

function singlesMatches(playing: number[], state: State): BuiltMatch[] {
  const remaining = [...playing].sort((a, b) => a - b);
  const matches: BuiltMatch[] = [];
  while (remaining.length > 0) {
    const anchor = remaining.shift() as number;
    let mateIndex = 0;
    let best = Number.POSITIVE_INFINITY;
    for (let index = 0; index < remaining.length; index += 1) {
      const faced = state.opponent[anchor][remaining[index]];
      if (faced < best) {
        best = faced;
        mateIndex = index;
      }
    }
    const mate = remaining.splice(mateIndex, 1)[0];
    matches.push(anchor < mate ? { sideA: [anchor], sideB: [mate] } : { sideA: [mate], sideB: [anchor] });
  }
  return matches;
}

function chooseSitters(playerCount: number, sitCount: number, round: number, state: State) {
  if (sitCount <= 0) return [];
  const order = Array.from({ length: playerCount }, (_, index) => index);
  order.sort((a, b) => {
    if (state.games[a] !== state.games[b]) return state.games[b] - state.games[a];
    const sinceA = sinceSat(state.lastSat[a], round);
    const sinceB = sinceSat(state.lastSat[b], round);
    if (sinceA !== sinceB) return sinceB - sinceA;
    return rotationKey(a, round, playerCount) - rotationKey(b, round, playerCount);
  });
  return order.slice(0, sitCount).sort((a, b) => a - b);
}

function sinceSat(lastSat: number, round: number) {
  return lastSat < 0 ? Number.POSITIVE_INFINITY : round - lastSat;
}

function rotationKey(player: number, round: number, playerCount: number) {
  return (player - (round % playerCount) + playerCount) % playerCount;
}

function bestSplit(players: number[], state: State): BuiltMatch {
  const [w, x, y, z] = [...players].sort((a, b) => a - b);
  const splits: Array<[Side, Side]> = [
    [
      [w, x],
      [y, z],
    ],
    [
      [w, y],
      [x, z],
    ],
    [
      [w, z],
      [x, y],
    ],
  ];

  let best = splits[0];
  let bestKey: [number, number, number] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  splits.forEach((split, index) => {
    const key: [number, number, number] = [
      state.partner[split[0][0]][split[0][1]] + state.partner[split[1][0]][split[1][1]],
      cross(split[0], split[1], state.opponent),
      index,
    ];
    if (compareKey(key, bestKey) < 0) {
      best = split;
      bestKey = key;
    }
  });

  return { sideA: ordered(best[0]), sideB: ordered(best[1]) };
}

function pairPlayers(playing: number[], state: State): Side[] {
  const remaining = [...playing].sort((a, b) => a - b);
  const pairs: Side[] = [];
  while (remaining.length > 0) {
    const anchor = remaining[0];
    let mateIndex = 1;
    let bestPartner = Number.POSITIVE_INFINITY;
    let bestOpponent = Number.POSITIVE_INFINITY;
    for (let index = 1; index < remaining.length; index += 1) {
      const mate = remaining[index];
      const partnerCount = state.partner[anchor][mate];
      const opponentCount = state.opponent[anchor][mate];
      if (
        partnerCount < bestPartner ||
        (partnerCount === bestPartner && opponentCount < bestOpponent)
      ) {
        bestPartner = partnerCount;
        bestOpponent = opponentCount;
        mateIndex = index;
      }
    }
    pairs.push(ordered([anchor, remaining[mateIndex]]));
    remaining.splice(mateIndex, 1);
    remaining.splice(0, 1);
  }
  return pairs;
}

function groupPairs(pairs: Side[], state: State): BuiltMatch[] {
  const left = [...pairs];
  const matches: BuiltMatch[] = [];
  while (left.length > 0) {
    const base = left.shift() as Side;
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    let bestTie = Number.POSITIVE_INFINITY;
    for (let index = 0; index < left.length; index += 1) {
      const score = cross(base, left[index], state.opponent);
      const tie = left[index][0];
      if (score < bestScore || (score === bestScore && tie < bestTie)) {
        bestScore = score;
        bestTie = tie;
        bestIndex = index;
      }
    }
    const other = left.splice(bestIndex, 1)[0];
    const [sideA, sideB] = base[0] < other[0] ? [base, other] : [other, base];
    matches.push({ sideA, sideB });
  }
  return matches;
}

function assignCourts(matches: BuiltMatch[], courtCount: number, state: State): BuiltMatch[] {
  let bestPerm = Array.from({ length: courtCount }, (_, index) => index);
  let bestCost = Number.POSITIVE_INFINITY;
  for (const perm of permutations(courtCount)) {
    let cost = 0;
    perm.forEach((matchIndex, court) => {
      const match = matches[matchIndex];
      for (const player of [...match.sideA, ...match.sideB]) cost += state.courts[player][court];
    });
    if (cost < bestCost) {
      bestCost = cost;
      bestPerm = perm;
    }
  }
  return bestPerm.map((matchIndex) => matches[matchIndex]);
}

function permutations(count: number): number[][] {
  const result: number[][] = [];
  const used = Array(count).fill(false);
  const current: number[] = [];

  function walk() {
    if (current.length === count) {
      result.push([...current]);
      return;
    }
    for (let index = 0; index < count; index += 1) {
      if (used[index]) continue;
      used[index] = true;
      current.push(index);
      walk();
      current.pop();
      used[index] = false;
    }
  }

  walk();
  return result;
}

function pairing(side: Side, state: State): Pairing {
  const [a, b] = ordered(side);
  return {
    players: [a, b],
    repeat: state.partner[a][b] > 0,
  };
}

function apply(state: State, round: Round, gameIndex: number) {
  for (const sitter of round.sitting) state.lastSat[sitter] = gameIndex;
  for (const match of round.matches) {
    for (const player of [...match.sideA, ...match.sideB]) {
      state.games[player] += 1;
      state.courts[player][match.courtIndex] += 1;
    }
    if (match.sideA.length === 2) addPair(state.partner, match.sideA[0], match.sideA[1]);
    if (match.sideB.length === 2) addPair(state.partner, match.sideB[0], match.sideB[1]);
    for (const player of match.sideA) {
      for (const opponent of match.sideB) addPair(state.opponent, player, opponent);
    }
  }
}

function createState(playerCount: number, courtCount: number): State {
  return {
    games: Array(playerCount).fill(0),
    lastSat: Array(playerCount).fill(-1),
    partner: square(playerCount),
    opponent: square(playerCount),
    courts: Array.from({ length: playerCount }, () => Array(courtCount).fill(0)),
  };
}

function square(size: number) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function addPair(matrix: number[][], a: number, b: number) {
  matrix[a][b] += 1;
  matrix[b][a] += 1;
}

function cross(a: Side, b: Side, matrix: number[][]) {
  let total = 0;
  for (const player of a) {
    for (const opponent of b) total += matrix[player][opponent];
  }
  return total;
}

function ordered(side: Side): [number, number] {
  return side[0] < side[1] ? [side[0], side[1]] : [side[1], side[0]];
}

function compareKey(a: [number, number, number], b: [number, number, number]) {
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}
