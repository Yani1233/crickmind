import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const mysteryRouter = Router();

mysteryRouter.get(
  "/random",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.mysterySquad.count();
      if (count === 0) {
        res.json({ data: null });
        return;
      }
      const skip = Math.floor(Math.random() * count);
      const squad = await prisma.mysterySquad.findFirst({ skip });
      res.json({ data: squad });
    } catch (err) {
      next(err);
    }
  }
);

mysteryRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.mysterySquad.count();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);
