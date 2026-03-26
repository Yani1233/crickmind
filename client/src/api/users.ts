import { apiFetch } from "./client";

export async function createUser(username: string) {
  return apiFetch<{ id: string; username: string; isNew: boolean }>("/users", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function getUserProfile(userId: string) {
  return apiFetch<{
    id: string;
    username: string;
    createdAt: string;
    totalScore: number;
    totalGames: number;
    modeStats: Record<string, { highScore: number; gamesPlayed: number; totalScore: number }>;
  }>(`/users/${userId}/profile`);
}
