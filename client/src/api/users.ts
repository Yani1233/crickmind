import { apiFetch } from "./client";

export async function createUser(email: string, displayName: string) {
  return apiFetch<{ id: string; email: string; displayName: string; isNew: boolean }>("/users", {
    method: "POST",
    body: JSON.stringify({ email, displayName }),
  });
}

export async function getUserProfile(userId: string) {
  return apiFetch<{
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    totalScore: number;
    totalGames: number;
    modeStats: Record<string, { highScore: number; gamesPlayed: number; totalScore: number }>;
  }>(`/users/${userId}/profile`);
}
