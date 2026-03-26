import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  searchPlayers,
  getRandomPlayer,
  getPlayerPair,
  getNextChallenger,
  getPlayerStats,
  getPlayerCount,
  getPlayerById,
} from "../services/playerService.js";

export const playerRouter = Router();

playerRouter.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = z.string().min(1).parse(req.query.q);
      const limit = req.query.limit
        ? z.coerce.number().int().min(1).max(50).parse(req.query.limit)
        : 10;
      const players = await searchPlayers(query, limit);
      res.json({ data: players });
    } catch (err) {
      next(err);
    }
  }
);

playerRouter.get(
  "/random",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const excludeRaw = req.query.exclude as string | undefined;
      const excludeIds = excludeRaw ? excludeRaw.split(",") : [];
      const player = await getRandomPlayer(excludeIds);
      res.json({ data: player });
    } catch (err) {
      next(err);
    }
  }
);

playerRouter.get(
  "/pair",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streak = req.query.streak
        ? z.coerce.number().int().min(0).parse(req.query.streak)
        : 0;
      const pair = await getPlayerPair(streak);
      res.json({ data: pair });
    } catch (err) {
      next(err);
    }
  }
);

playerRouter.get(
  "/next-challenger",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentId = z.string().uuid().parse(req.query.current_id);
      const streak = req.query.streak
        ? z.coerce.number().int().min(0).parse(req.query.streak)
        : 0;
      const challenger = await getNextChallenger(currentId, streak);
      res.json({ data: challenger });
    } catch (err) {
      next(err);
    }
  }
);

playerRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await getPlayerCount();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);

playerRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = z.string().uuid().parse(req.params.id);
      const player = await getPlayerById(id);
      res.json({ data: player });
    } catch (err) {
      next(err);
    }
  }
);

playerRouter.get(
  "/:id/stats",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = z.string().uuid().parse(req.params.id);
      const reveal = z.coerce.number().int().min(0).max(3).parse(req.query.reveal ?? 0);
      const stats = await getPlayerStats(id, reveal);
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  }
);
