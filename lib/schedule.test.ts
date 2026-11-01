import assert from "node:assert/strict";
import test from "node:test";
import { getRound } from "./schedule";

test("five players on one court follow the perfect cycle", () => {
  const expected: Array<{ sit: number[]; a: [number, number]; b: [number, number] }> = [
    { sit: [4], a: [0, 1], b: [2, 3] },
    { sit: [3], a: [0, 2], b: [1, 4] },
    { sit: [2], a: [0, 4], b: [1, 3] },
    { sit: [1], a: [0, 3], b: [2, 4] },
    { sit: [0], a: [1, 2], b: [3, 4] },
  ];

  const partners = new Map<string, number>();
  const opponents = new Map<string, number>();

  expected.forEach((game, index) => {
    const round = getRound(5, 1, index);
    assert.deepEqual(round.sitting, game.sit);
    assert.deepEqual(round.matches[0].sideA, game.a);
    assert.deepEqual(round.matches[0].sideB, game.b);
    assert.equal(round.matches[0].pairs.every((pair) => !pair.repeat), true);
    countPair(partners, game.a);
    countPair(partners, game.b);
    for (const player of game.a) {
      for (const opponent of game.b) countPair(opponents, [player, opponent]);
    }
  });

  assert.equal(partners.size, 10);
  for (const count of partners.values()) assert.equal(count, 1);
  assert.equal(opponents.size, 10);
  for (const count of opponents.values()) assert.equal(count, 2);

  const repeat = getRound(5, 1, 5);
  assert.deepEqual(repeat.matches[0].sideA, [2, 3]);
  assert.deepEqual(repeat.matches[0].sideB, [0, 1]);
  assert.equal(repeat.matches[0].pairs.every((pair) => pair.repeat), true);
});

test("four players rotate through every pairing and nobody sits", () => {
  const seen = new Set<string>();
  for (let game = 0; game < 3; game += 1) {
    const round = getRound(4, 1, game);
    assert.deepEqual(round.sitting, []);
    seen.add(pairingKey(round.matches[0].sideA, round.matches[0].sideB));
  }
  assert.equal(seen.size, 3);
});

test("eight players fill two courts without anyone doubled", () => {
  for (let game = 0; game < 6; game += 1) {
    const round = getRound(8, 2, game);
    assert.equal(round.sitting.length, 0);
    assert.equal(round.matches.length, 2);
    const players = round.matches.flatMap((match) => [...match.sideA, ...match.sideB]);
    assert.equal(new Set(players).size, 8);
  }
});

test("games played and sits stay within one across a long run", () => {
  const setups: Array<[number, number, number]> = [
    [4, 1, 12],
    [5, 1, 15],
    [6, 1, 24],
    [7, 1, 21],
    [8, 2, 16],
    [9, 2, 18],
    [12, 2, 18],
    [16, 4, 12],
  ];

  for (const [players, courts, rounds] of setups) {
    const played = Array(players).fill(0);
    const sat = Array(players).fill(0);
    for (let game = 0; game < rounds; game += 1) {
      const round = getRound(players, courts, game);
      const seen = new Set<number>();
      assert.equal(round.matches.length, courts);
      assert.equal(round.sitting.length, players - courts * 4);
      for (const sitter of round.sitting) {
        assert.equal(seen.has(sitter), false);
        seen.add(sitter);
        sat[sitter] += 1;
      }
      for (const [courtIndex, match] of round.matches.entries()) {
        assert.equal(match.courtIndex, courtIndex);
        for (const player of [...match.sideA, ...match.sideB]) {
          assert.equal(seen.has(player), false);
          seen.add(player);
          played[player] += 1;
        }
      }
      assert.equal(seen.size, players);
      assert.ok(span(played) <= 1, `${players} players, ${courts} courts, game ${game}`);
      assert.ok(span(sat) <= 1, `${players} players, ${courts} courts, game ${game}`);
    }
  }
});

function countPair(map: Map<string, number>, pair: [number, number]) {
  const key = [...pair].sort((a, b) => a - b).join("-");
  map.set(key, (map.get(key) ?? 0) + 1);
}

function pairingKey(a: [number, number], b: [number, number]) {
  return [a.join("-"), b.join("-")].sort().join("|");
}

function span(values: number[]) {
  return Math.max(...values) - Math.min(...values);
}
