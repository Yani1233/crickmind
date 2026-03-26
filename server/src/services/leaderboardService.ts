import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getLeaderboard(mode?: string, limit = 20) {
  const where = mode ? { mode } : {};

  const results = await prisma.gameSession.groupBy({
    by: ["userId"],
    where: { ...where, userId: { not: null } },
    _sum: { score: true },
    _count: { id: true },
    _max: { score: true },
    orderBy: { _sum: { score: "desc" } },
    take: limit,
  });

  const userIds = results.map(r => r.userId!).filter(Boolean);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, displayName: true },
  });
  const userMap = new Map(users.map(u => [u.id, u.displayName]));

  return results.map((r, i) => ({
    rank: i + 1,
    userId: r.userId!,
    username: userMap.get(r.userId!) ?? "Unknown",
    totalScore: r._sum.score ?? 0,
    highScore: r._max.score ?? 0,
    gamesPlayed: r._count.id,
  }));
}

export async function getRoomLeaderboard(roomCode: string, mode?: string, limit = 20) {
  const room = await prisma.room.findUnique({
    where: { code: roomCode },
    include: { members: { select: { userId: true } } },
  });
  if (!room) throw new Error("Room not found");

  const memberIds = room.members.map(m => m.userId);
  const where: Record<string, unknown> = { userId: { in: memberIds } };
  if (mode) where.mode = mode;

  const results = await prisma.gameSession.groupBy({
    by: ["userId"],
    where: { ...where, userId: { not: null } } as any,
    _sum: { score: true },
    _count: { id: true },
    _max: { score: true },
    orderBy: { _sum: { score: "desc" } },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, displayName: true },
  });
  const userMap = new Map(users.map(u => [u.id, u.displayName]));

  return results.map((r, i) => ({
    rank: i + 1,
    userId: r.userId!,
    username: userMap.get(r.userId!) ?? "Unknown",
    totalScore: r._sum.score ?? 0,
    highScore: r._max.score ?? 0,
    gamesPlayed: r._count.id,
  }));
}
