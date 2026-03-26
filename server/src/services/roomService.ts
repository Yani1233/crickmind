import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 for readability
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createRoom(userId: string) {
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const room = await prisma.room.create({
    data: {
      code,
      members: { create: { userId } },
    },
    include: { members: { include: { user: { select: { id: true, username: true } } } } },
  });

  return {
    code: room.code,
    members: room.members.map(m => ({ userId: m.user.id, username: m.user.username })),
  };
}

export async function joinRoom(userId: string, code: string) {
  const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
  if (!room) throw new Error("Room not found");

  // Check if already a member
  const existing = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId, roomId: room.id } },
  });
  if (existing) {
    // Already a member, just return room info
    return getRoomInfo(code);
  }

  await prisma.roomMember.create({ data: { userId, roomId: room.id } });
  return getRoomInfo(code);
}

export async function getRoomInfo(code: string) {
  const room = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: { members: { include: { user: { select: { id: true, username: true } } } } },
  });
  if (!room) throw new Error("Room not found");

  return {
    code: room.code,
    members: room.members.map(m => ({ userId: m.user.id, username: m.user.username })),
  };
}

export async function leaveRoom(userId: string, code: string) {
  const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
  if (!room) throw new Error("Room not found");

  await prisma.roomMember.deleteMany({ where: { userId, roomId: room.id } });
  return { success: true };
}
