import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createOrGetUser(email: string, displayName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = displayName.trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    // Update display name if changed
    if (existing.displayName !== trimmedName) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { displayName: trimmedName },
      });
      return { ...updated, isNew: false };
    }
    return { ...existing, isNew: false };
  }

  const user = await prisma.user.create({
    data: { email: normalizedEmail, displayName: trimmedName },
  });
  return { ...user, isNew: true };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const sessions = await prisma.gameSession.findMany({
    where: { userId },
    select: { mode: true, score: true },
  });

  const modeStats: Record<string, { highScore: number; gamesPlayed: number; totalScore: number }> = {};
  let totalScore = 0;

  for (const s of sessions) {
    if (!modeStats[s.mode]) modeStats[s.mode] = { highScore: 0, gamesPlayed: 0, totalScore: 0 };
    modeStats[s.mode].gamesPlayed++;
    modeStats[s.mode].totalScore += s.score;
    if (s.score > modeStats[s.mode].highScore) modeStats[s.mode].highScore = s.score;
    totalScore += s.score;
  }

  return { ...user, totalScore, totalGames: sessions.length, modeStats };
}
