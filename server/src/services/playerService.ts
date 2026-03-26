import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

const STAT_CATEGORIES = [
  { label: "Total Runs", key: "totalRuns" },
  { label: "Batting Average", key: "battingAvg" },
  { label: "Strike Rate", key: "strikeRate" },
  { label: "Total Wickets", key: "totalWickets" },
  { label: "Total Matches", key: "totalMatches" },
] as const;

const BATSMAN_STATS = [
  { label: "Batting Average", key: "battingAvg" },
  { label: "Strike Rate", key: "strikeRate" },
  { label: "Total Runs", key: "totalRuns" },
  { label: "Total Matches", key: "totalMatches" },
];

const BOWLER_STATS = [
  { label: "Bowling Average", key: "bowlingAvg" },
  { label: "Economy Rate", key: "economyRate" },
  { label: "Total Wickets", key: "totalWickets" },
  { label: "Total Matches", key: "totalMatches" },
];

const ALLROUNDER_STATS = [
  { label: "Batting Average", key: "battingAvg" },
  { label: "Bowling Average", key: "bowlingAvg" },
  { label: "Total Runs", key: "totalRuns" },
  { label: "Total Wickets", key: "totalWickets" },
];

export async function searchPlayers(query: string, limit = 10) {
  const players = await prisma.player.findMany({
    where: {
      verified: true,
      name: { contains: query, mode: "insensitive" },
    },
    select: { id: true, name: true, country: true },
    take: limit,
  });
  return players;
}

export async function getRandomPlayer(excludeIds: string[] = []) {
  const whereClause: Record<string, unknown> = { verified: true };
  if (excludeIds.length > 0) {
    whereClause.id = { notIn: excludeIds };
  }

  const count = await prisma.player.count({ where: whereClause });
  if (count === 0) {
    throw new AppError(404, "NO_PLAYERS", "No verified players available");
  }

  const skip = Math.floor(Math.random() * count);
  const player = await prisma.player.findFirst({
    where: whereClause,
    skip,
  });

  return player;
}

export async function getPlayerById(id: string) {
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    throw new AppError(404, "PLAYER_NOT_FOUND", "Player not found");
  }
  return player;
}

export async function getPlayerPair(streak = 0) {
  const count = await prisma.player.count({ where: { verified: true } });
  if (count < 2) {
    throw new AppError(
      404,
      "INSUFFICIENT_PLAYERS",
      "Need at least 2 verified players"
    );
  }

  const { tierFilter, minGap } = getDifficultyParams(streak);

  const players = await prisma.player.findMany({
    where: {
      verified: true,
      ...(tierFilter ? { popularityTier: { in: tierFilter } } : {}),
    },
  });

  if (players.length < 2) {
    // Fallback: use all verified players
    const allPlayers = await prisma.player.findMany({
      where: { verified: true },
    });
    return pickPairWithStat(allPlayers, minGap);
  }

  return pickPairWithStat(players, minGap);
}

export async function getNextChallenger(currentId: string, streak = 0) {
  const { tierFilter } = getDifficultyParams(streak);

  const players = await prisma.player.findMany({
    where: {
      verified: true,
      id: { not: currentId },
      ...(tierFilter ? { popularityTier: { in: tierFilter } } : {}),
    },
  });

  if (players.length === 0) {
    const allPlayers = await prisma.player.findMany({
      where: { verified: true, id: { not: currentId } },
    });
    if (allPlayers.length === 0) {
      throw new AppError(404, "NO_CHALLENGERS", "No challengers available");
    }
    return {
      player: allPlayers[Math.floor(Math.random() * allPlayers.length)],
      statCategory: pickRandomStat(),
    };
  }

  return {
    player: players[Math.floor(Math.random() * players.length)],
    statCategory: pickRandomStat(),
  };
}

export async function getPlayerStats(id: string, revealIndex: number) {
  const player = await getPlayerById(id);

  let statPool;
  if (player.role === "Bowler") {
    statPool = BOWLER_STATS;
  } else if (player.role === "All-rounder") {
    statPool = ALLROUNDER_STATS;
  } else {
    statPool = BATSMAN_STATS;
  }

  const revealed = statPool.slice(0, revealIndex + 1).map((stat) => ({
    label: stat.label,
    value: player[stat.key as keyof typeof player],
  }));

  return { revealed, totalStats: statPool.length };
}

export async function getPlayerCount() {
  return prisma.player.count({ where: { verified: true } });
}

function getDifficultyParams(streak: number) {
  if (streak >= 8) {
    return { tierFilter: null, minGap: 0 };
  }
  if (streak >= 4) {
    return { tierFilter: [1, 2, 3], minGap: 0.15 };
  }
  return { tierFilter: [1, 2], minGap: 0.3 };
}

function pickRandomStat() {
  const stat =
    STAT_CATEGORIES[Math.floor(Math.random() * STAT_CATEGORIES.length)];
  return { label: stat.label, key: stat.key };
}

function pickPairWithStat(
  players: Array<Record<string, unknown>>,
  _minGap: number
) {
  const stat = pickRandomStat();
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  return {
    playerA: shuffled[0],
    playerB: shuffled[1],
    statCategory: stat,
  };
}
