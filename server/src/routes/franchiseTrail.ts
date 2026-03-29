import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const franchiseTrailRouter = Router();

franchiseTrailRouter.get(
  "/random",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const excludeRaw = req.query.exclude;
      const excludeNames: string[] = excludeRaw
        ? z.string().parse(excludeRaw).split(",").map((n) => n.trim()).filter(Boolean)
        : [];

      const allCareers = await prisma.iplCareer.findMany({
        where: {
          playerName: { notIn: excludeNames },
        },
      });

      if (allCareers.length === 0) {
        res.status(404).json({ error: "No careers available", code: "NO_CAREERS" });
        return;
      }

      // Weight toward players with more stints (more interesting puzzles)
      const weighted = allCareers.flatMap((c) => {
        const stints = c.stints as Array<{ team: string; startYear: number; endYear: number }>;
        const weight = Math.min(stints.length, 4);
        return Array.from({ length: weight }, () => c);
      });

      const selected = weighted[Math.floor(Math.random() * weighted.length)];

      res.json({
        data: {
          playerName: selected.playerName,
          stints: selected.stints,
          totalTeams: selected.totalTeams,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

franchiseTrailRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.iplCareer.count();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);
