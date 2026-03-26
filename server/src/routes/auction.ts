import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auctionRouter = Router();

auctionRouter.get(
  "/random",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = req.query.count
        ? z.coerce.number().int().min(1).max(30).parse(req.query.count)
        : 10;
      const allEntries = await prisma.auctionEntry.findMany();
      if (allEntries.length === 0) {
        res.json({ data: [] });
        return;
      }
      const shuffled = [...allEntries].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      res.json({ data: selected });
    } catch (err) {
      next(err);
    }
  }
);

auctionRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.auctionEntry.count();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);
