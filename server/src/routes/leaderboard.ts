import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getLeaderboard, getRoomLeaderboard } from "../services/leaderboardService.js";

export const leaderboardRouter = Router();

const querySchema = z.object({
  mode: z.enum(["who-am-i", "stat-attack", "quick-fire", "higher-or-lower"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

leaderboardRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mode, limit } = querySchema.parse(req.query);
    const entries = await getLeaderboard(mode, limit);
    res.json({ data: entries });
  } catch (err) { next(err); }
});

leaderboardRouter.get("/room/:code", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mode, limit } = querySchema.parse(req.query);
    const entries = await getRoomLeaderboard(req.params.code as string, mode, limit);
    res.json({ data: entries });
  } catch (err) { next(err); }
});
