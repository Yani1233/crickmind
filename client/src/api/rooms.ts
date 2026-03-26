import { apiFetch } from "./client";

interface RoomInfo {
  code: string;
  members: Array<{ userId: string; displayName: string }>;
}

export async function createRoom(userId: string) {
  return apiFetch<RoomInfo>("/rooms", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function joinRoom(userId: string, code: string) {
  return apiFetch<RoomInfo>("/rooms/join", {
    method: "POST",
    body: JSON.stringify({ userId, code }),
  });
}

export async function getRoomInfo(code: string) {
  return apiFetch<RoomInfo>(`/rooms/${code}`);
}

export async function leaveRoom(userId: string, code: string) {
  return apiFetch<{ success: boolean }>(`/rooms/${code}/leave`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
