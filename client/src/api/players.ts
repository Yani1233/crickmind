import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Player } from "../../../shared/src/types";

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ["playerSearch", query],
    queryFn: () =>
      apiFetch<Array<{ id: string; name: string; country: string }>>(
        `/players/search?q=${encodeURIComponent(query)}`
      ),
    enabled: query.length >= 2,
    staleTime: 60_000,
  });
}

export function useRandomPlayer(excludeIds: string[] = []) {
  const excludeParam = excludeIds.length > 0 ? `?exclude=${excludeIds.join(",")}` : "";
  return useQuery({
    queryKey: ["randomPlayer", excludeIds],
    queryFn: () => apiFetch<Player>(`/players/random${excludeParam}`),
    enabled: false, // manual refetch only
  });
}

export function usePlayerPair() {
  return useQuery({
    queryKey: ["playerPair"],
    queryFn: () =>
      apiFetch<{
        playerA: Player;
        playerB: Player;
        statCategory: { label: string; key: string };
      }>("/players/pair"),
    enabled: false,
  });
}

export function useNextChallenger(currentId: string, streak: number) {
  return useQuery({
    queryKey: ["nextChallenger", currentId, streak],
    queryFn: () =>
      apiFetch<{ player: Player; statCategory: { label: string; key: string } }>(
        `/players/next-challenger?current_id=${currentId}&streak=${streak}`
      ),
    enabled: false,
  });
}

export function usePlayerStats(id: string, revealIndex: number) {
  return useQuery({
    queryKey: ["playerStats", id, revealIndex],
    queryFn: () =>
      apiFetch<{ revealed: Array<{ label: string; value: number | string }>; totalStats: number }>(
        `/players/${id}/stats?reveal=${revealIndex}`
      ),
    enabled: !!id,
  });
}

export function usePlayerCount() {
  return useQuery({
    queryKey: ["playerCount"],
    queryFn: () => apiFetch<{ count: number }>("/players/count"),
  });
}

export function usePlayerById(id: string) {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => apiFetch<Player>(`/players/${id}`),
    enabled: !!id,
  });
}
