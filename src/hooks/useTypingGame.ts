import { useCallback, useEffect, useRef, useState } from "react";

export type GameStatus =
  | "ready"
  | "playing"
  | "paused"
  | "gameover"
  | "level-complete";

export interface HorizontalTile {
  id: number;
  letter: string;
  x: number;
  index: number;
}

interface PassageTarget {
  letter: string;
  characterIndex: number;
}

interface GameState {
  status: GameStatus;
  stage: number;
  lives: number;
  score: number;
  correctKeys: number;
  mistakes: number;
  combo: number;
  bestScore: number;
  elapsedMs: number;
  passage: string;
  targets: PassageTarget[];
  progress: number;
  nextTarget: number;
  spawnIndex: number;
  lastSpawnAt: number;
  tiles: HorizontalTile[];
}

const RECENT_PASSAGES_KEY = "falling-letters-recent-passages";
const BEST_SCORE_KEY = "falling-letters-best-score";
const MAX_RECENT_PASSAGES = 24;
const TILE_START_X = 7;
const TILE_END_X = 91;
const TILE_GAP_MS = 360;

const adjectives = [
  "bright", "calm", "clever", "curious", "eager", "gentle", "golden",
  "nimble", "patient", "quiet", "steady", "sunny", "thoughtful", "warm",
  "careful", "brave", "quick", "kind", "fresh", "useful",
];
const people = [
  "artist", "drummer", "gardener", "musician", "reader", "student",
  "teacher", "traveler", "writer", "friend",
];
const things = [
  "bird", "book", "bridge", "cloud", "garden", "harbor", "island",
  "lantern", "market", "path", "river", "story", "window", "forest",
  "village", "piano", "letter", "signal",
];
const places = [
  "near the river", "through the garden", "along the shore",
  "on a sunny street", "beside the market", "under the trees",
  "past the old bridge", "across town",
];
const actions = [
  ["carries", "a blue notebook"],
  ["chooses", "a simple map"],
  ["discovers", "a new idea"],
  ["finds", "a hidden path"],
  ["notices", "a bright lantern"],
  ["opens", "a wooden box"],
  ["paints", "a paper kite"],
  ["shares", "a short story"],
  ["writes", "a kind message"],
  ["explores", "the quiet garden"],
];
const sentencePatterns: Array<() => string[]> = [
  () => {
    const [verb, object] = pick(actions);
    return ["a", pick(adjectives), pick(people), verb, ...object.split(" "), ...pick(places).split(" ")];
  },
  () => ["each", "morning", "a", pick(people), "practices", "a", "new", "skill", "with", "care"],
  () => ["a", pick(adjectives), "student", "can", "learn", "a", "new", "skill", "with", "patience"],
  () => ["near", "the", "river", "a", pick(adjectives), "student", "writes", "a", "short", "message"],
  () => ["the", pick(["river", "bird", "cloud", "boat"]), "moves", pick(["slowly", "steadily", "quietly"]), ...pick(places).split(" ")],
  () => ["friends", "gather", ...pick(places).split(" "), "to", "share", "a", "good", "story"],
  () => ["a", pick(adjectives), "reader", "finds", "a", "quiet", "place", "to", "study"],
  () => ["small", "habits", "help", "people", "build", "confidence", "one", "day", "at", "a", "time"],
  () => ["the", pick(things), "rests", "beside", "the", pick(things), "while", "a", pick(people), "reads"],
  () => ["when", "people", "practice", "with", "patience", "their", "hands", "move", "with", "more", "confidence"],
  () => ["a", pick(adjectives), "idea", "can", "turn", "an", "ordinary", "day", "into", "a", "good", "story"],
  () => ["every", "useful", "idea", "begins", "with", "one", "clear", "thought"],
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeSentence(): string[] {
  return pick(sentencePatterns)();
}

function readRecentPassages(): string[] {
  try {
    const stored = window.localStorage.getItem(RECENT_PASSAGES_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function createPassage(wordCount: number): string {
  const recent = new Set(readRecentPassages());
  let passage = "";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const words: string[] = [];
    const seenSentences = new Set<string>();
    while (words.length < wordCount) {
      const sentence = makeSentence();
      sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
      sentence[sentence.length - 1] = `${sentence[sentence.length - 1]}.`;
      const sentenceKey = sentence.join(" ").toLowerCase();
      if (seenSentences.has(sentenceKey)) continue;
      seenSentences.add(sentenceKey);
      words.push(...sentence);
    }

    const selected = words.slice(0, wordCount);
    selected[selected.length - 1] = selected[selected.length - 1].replace(/[.,!?;:]?$/, ".");
    passage = selected.join(" ");
    if (!recent.has(passage)) break;
  }

  try {
    const nextRecent = [passage, ...recent].slice(0, MAX_RECENT_PASSAGES);
    window.localStorage.setItem(RECENT_PASSAGES_KEY, JSON.stringify(nextRecent));
  } catch {
    // storage unavailable
  }
  return passage;
}

function getTargets(passage: string): PassageTarget[] {
  const targets: PassageTarget[] = [];
  for (let characterIndex = 0; characterIndex < passage.length; characterIndex += 1) {
    const character = passage[characterIndex];
    if (/[a-z]/i.test(character)) {
      targets.push({ letter: character.toLowerCase(), characterIndex });
    }
  }
  return targets;
}

function progressAtTarget(targets: PassageTarget[], targetIndex: number, passageLength: number): number {
  return targets[targetIndex]?.characterIndex ?? passageLength;
}

function getBestScore(): number {
  try {
    return Number(window.localStorage.getItem(BEST_SCORE_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function createInitialState(stage = 1, status: GameStatus = "ready"): GameState {
  return {
    status,
    stage,
    lives: 3,
    score: 0,
    correctKeys: 0,
    mistakes: 0,
    combo: 0,
    bestScore: getBestScore(),
    elapsedMs: 0,
    passage: "",
    targets: [],
    progress: 0,
    nextTarget: 0,
    spawnIndex: 0,
    lastSpawnAt: 0,
    tiles: [],
  };
}

function stageWordCount(stage: number): number {
  return stage * 50;
}

export function useTypingGame() {
  const initial = useRef<GameState | null>(null);
  if (!initial.current) initial.current = createInitialState();
  const [game, setGame] = useState<GameState>(initial.current);
  const gameRef = useRef(game);
  const tileIdRef = useRef(0);

  const publish = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(next);
  }, []);

  const beginStage = useCallback(
    (
      stage: number,
      status: GameStatus = "playing",
      carry?: Pick<
        GameState,
        "lives" | "score" | "correctKeys" | "mistakes" | "combo" | "elapsedMs"
      >,
    ) => {
      const passage = createPassage(stageWordCount(stage));
      const targets = getTargets(passage);
      const firstTile: HorizontalTile | null = targets[0]
        ? {
            id: ++tileIdRef.current,
            letter: targets[0].letter,
            x: TILE_START_X,
            index: 0,
          }
        : null;

      publish({
        ...createInitialState(stage, status),
        bestScore: gameRef.current.bestScore,
        ...(carry ?? {}),
        passage,
        targets,
        lastSpawnAt: carry?.elapsedMs ?? 0,
        spawnIndex: firstTile ? 1 : 0,
        tiles: firstTile ? [firstTile] : [],
      });
    },
    [publish],
  );

  const startGame = useCallback(() => beginStage(1), [beginStage]);
  const retryStage = useCallback(
    () => beginStage(gameRef.current.stage),
    [beginStage],
  );
  const continueToNextStage = useCallback(
    () => {
      const current = gameRef.current;
      beginStage(current.stage + 1, "playing", {
        lives: current.lives,
        score: current.score,
        correctKeys: current.correctKeys,
        mistakes: current.mistakes,
        combo: current.combo,
        elapsedMs: current.elapsedMs,
      });
    },
    [beginStage],
  );
  const pauseGame = useCallback(() => {
    const current = gameRef.current;
    if (current.status === "playing") publish({ ...current, status: "paused" });
  }, [publish]);
  const resumeGame = useCallback(() => {
    const current = gameRef.current;
    if (current.status === "paused") publish({ ...current, status: "playing" });
  }, [publish]);

  useEffect(() => {
    if (game.status !== "playing") return;

    let frame = 0;
    let previousTime = performance.now();
    const tick = (now: number) => {
      const current = gameRef.current;
      if (current.status !== "playing") return;

      const deltaMs = Math.min(now - previousTime, 80);
      previousTime = now;
      const elapsedMs = current.elapsedMs + deltaMs;
      const stageBoost = Math.max(0, current.stage - 1);
      const spawnInterval = TILE_GAP_MS;
      const travelSpeed = 22 + stageBoost * 1.35 + Math.floor(current.score / 500) * 0.25;
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let tiles = current.tiles.map((tile) => ({
        ...tile,
        x: Math.min(
          TILE_END_X,
          tile.x + (prefersReducedMotion ? 0 : (travelSpeed * deltaMs) / 1000),
        ),
      }));
      let spawnIndex = current.spawnIndex;
      let lastSpawnAt = current.lastSpawnAt;

      const missedTile = tiles[0]?.x >= TILE_END_X ? tiles[0] : undefined;
      if (missedTile) {
        const lives = current.lives - 1;
        const retryTile: HorizontalTile | null =
          lives > 0
            ? {
                id: ++tileIdRef.current,
                letter: missedTile.letter,
                x: TILE_START_X,
                index: missedTile.index,
              }
            : null;

        publish({
          ...current,
          status: lives <= 0 ? "gameover" : "playing",
          lives: Math.max(0, lives),
          mistakes: current.mistakes + 1,
          combo: 0,
          tiles: retryTile ? [retryTile] : [],
          lastSpawnAt: elapsedMs,
          elapsedMs,
        });
        if (lives > 0) frame = requestAnimationFrame(tick);
        return;
      }

      if (
        spawnIndex < current.targets.length &&
        tiles.length === 0 &&
        elapsedMs - lastSpawnAt >= spawnInterval
      ) {
        const target = current.targets[spawnIndex];
        tiles = [
          ...tiles,
          {
            id: ++tileIdRef.current,
            letter: target.letter,
            x: TILE_START_X,
            index: spawnIndex,
          },
        ];
        spawnIndex += 1;
        lastSpawnAt = elapsedMs;
      }

      publish({
        ...current,
        tiles,
        spawnIndex,
        lastSpawnAt,
        elapsedMs,
      });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [game.status, publish]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const current = gameRef.current;
      const isSpace = event.code === "Space" || event.key === " ";
      const focusedControl =
        event.target instanceof HTMLElement &&
        event.target.closest("button, a, input, select, textarea");

      if (current.status === "ready" && isSpace && !focusedControl) {
        event.preventDefault();
        startGame();
        return;
      }
      if (current.status === "playing" && event.key === "Escape") {
        event.preventDefault();
        pauseGame();
        return;
      }
      if (
        current.status === "paused" &&
        (event.key === "Escape" || (isSpace && !focusedControl))
      ) {
        event.preventDefault();
        resumeGame();
        return;
      }
      if (
        current.status !== "playing" ||
        event.repeat ||
        !/^[a-z]$/i.test(event.key)
      ) {
        return;
      }

      const target = current.targets[current.nextTarget];
      const targetTile = current.tiles.find(
        (tile) => tile.index === current.nextTarget,
      );

      if (target && targetTile && event.key.toLowerCase() === target.letter) {
        const correctKeys = current.correctKeys + 1;
        const score = current.score + 10 + Math.min(current.combo, 20);
        const bestScore = Math.max(current.bestScore, score);
        const nextTarget = current.nextTarget + 1;
        const progress = progressAtTarget(
          current.targets,
          nextTarget,
          current.passage.length,
        );
        const remainingTiles = current.tiles.filter(
          (tile) => tile.index !== current.nextTarget,
        );
        const status =
          nextTarget >= current.targets.length ? "level-complete" : "playing";

        try {
          if (bestScore > current.bestScore) {
            window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
          }
        } catch {
          // storage unavailable
        }

        publish({
          ...current,
          status,
          score,
          bestScore,
          correctKeys,
          combo: current.combo + 1,
          nextTarget,
          progress,
          tiles: status === "level-complete" ? [] : remainingTiles,
          spawnIndex: Math.max(current.spawnIndex, nextTarget),
          lastSpawnAt: current.elapsedMs,
        });
        return;
      }

      const lives = current.lives - 1;
      publish({
        ...current,
        status: lives <= 0 ? "gameover" : "playing",
        lives: Math.max(0, lives),
        mistakes: current.mistakes + 1,
        combo: 0,
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pauseGame, publish, resumeGame, startGame]);

  const accuracy =
    game.correctKeys + game.mistakes === 0
      ? 100
      : Math.round(
          (game.correctKeys / (game.correctKeys + game.mistakes)) * 100,
        );
  const passagePrefix = game.passage.slice(0, game.progress).trim();
  const isPartwayThroughWord =
    game.progress > 0 &&
    game.progress < game.passage.length &&
    /[a-z]/i.test(game.passage[game.progress - 1]) &&
    /[a-z]/i.test(game.passage[game.progress]);
  const wordsCompleted = Math.min(
    stageWordCount(game.stage),
    passagePrefix
      ? passagePrefix.split(/\s+/).filter(Boolean).length -
          (isPartwayThroughWord ? 1 : 0)
      : 0,
  );

  return {
    status: game.status,
    stage: game.stage,
    wordsPerStage: stageWordCount(game.stage),
    wordsCompleted,
    lives: game.lives,
    score: game.score,
    wpm:
      game.elapsedMs > 0
        ? Math.round(game.correctKeys / 5 / (game.elapsedMs / 60_000))
        : 0,
    accuracy,
    combo: game.combo,
    bestScore: game.bestScore,
    passage: game.passage,
    progress: game.progress,
    tiles: game.tiles,
    startGame,
    retryStage,
    pauseGame,
    resumeGame,
    continueToNextStage,
  };
}
