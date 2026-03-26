import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const timelineRouter = Router();

timelineRouter.get(
  "/random",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = req.query.count
        ? z.coerce.number().int().min(1).max(20).parse(req.query.count)
        : 6;
      const allEvents = await prisma.timelineEvent.findMany();
      if (allEvents.length === 0) {
        res.json({ data: [] });
        return;
      }
      const shuffled = [...allEvents].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      res.json({ data: selected });
    } catch (err) {
      next(err);
    }
  }
);

timelineRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.timelineEvent.count();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);
