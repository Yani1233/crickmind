import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createRoom, joinRoom, getRoomInfo, leaveRoom } from "../services/roomService.js";

export const roomRouter = Router();

const userIdSchema = z.object({ userId: z.string().uuid() });
const joinSchema = z.object({ userId: z.string().uuid(), code: z.string().length(6) });

roomRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = userIdSchema.parse(req.body);
    const room = await createRoom(userId);
    res.status(201).json({ data: room });
  } catch (err) { next(err); }
});

roomRouter.post("/join", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, code } = joinSchema.parse(req.body);
    const room = await joinRoom(userId, code);
    res.json({ data: room });
  } catch (err) { next(err); }
});

roomRouter.get("/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await getRoomInfo(req.params.code as string);
    res.json({ data: room });
  } catch (err) { next(err); }
});

roomRouter.post("/:code/leave", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = userIdSchema.parse(req.body);
    const result = await leaveRoom(userId, req.params.code as string);
    res.json({ data: result });
  } catch (err) { next(err); }
});
