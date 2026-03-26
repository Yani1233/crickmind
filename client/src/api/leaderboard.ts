import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalScore: number;
  highScore: number;
  gamesPlayed: number;
}

export function useLeaderboard(mode?: string) {
  const params = mode ? `?mode=${mode}` : "";
  return useQuery({
    queryKey: ["leaderboard", mode ?? "all"],
    queryFn: () => apiFetch<LeaderboardEntry[]>(`/leaderboard${params}`),
    staleTime: 30_000,
  });
}

export function useRoomLeaderboard(code: string | null, mode?: string) {
  const params = mode ? `?mode=${mode}` : "";
  return useQuery({
    queryKey: ["room-leaderboard", code, mode ?? "all"],
    queryFn: () => apiFetch<LeaderboardEntry[]>(`/leaderboard/room/${code}${params}`),
    enabled: !!code,
    staleTime: 30_000,
  });
}
