import assert from "node:assert/strict";
import test from "node:test";
import { assertDecidedScore, rankStandings } from "./standings";
import type { CourtResult } from "./types";

const names = ["Ana", "Ben", "Cal", "Dee", "Eve"];

test("a 21–15 win gives each winner a point and the margin", () => {
  const results: CourtResult[] = [{ gameIndex: 0, courtIndex: 0, scoreA: 21, scoreB: 15 }];
  const board = rankStandings(names, 1, results);

  assert.deepEqual(
    board.map((row) => [row.name, row.points, row.margin]),
    [
      ["Ana", 1, 6],
      ["Ben", 1, 6],
      ["Eve", 0, 0],
      ["Cal", 0, -6],
      ["Dee", 0, -6],
    ],
  );
});

test("points rank first and margin splits people on the same points", () => {
  const results: CourtResult[] = [
    { gameIndex: 0, courtIndex: 0, scoreA: 21, scoreB: 19 },
    { gameIndex: 1, courtIndex: 0, scoreA: 21, scoreB: 10 },
  ];
  const board = rankStandings(names, 1, results);

  assert.deepEqual(
    board.map((row) => [row.name, row.points, row.margin]),
    [
      ["Ana", 2, 13],
      ["Cal", 1, 9],
      ["Ben", 1, -9],
      ["Dee", 0, -2],
      ["Eve", 0, -11],
    ],
  );
});

test("a tied score is rejected", () => {
  assert.throws(() => assertDecidedScore(15, 15), /tie/);
  assert.throws(
    () => rankStandings(names, 1, [{ gameIndex: 0, courtIndex: 0, scoreA: 21, scoreB: 21 }]),
    /tie/,
  );
});
