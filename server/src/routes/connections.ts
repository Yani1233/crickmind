import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const connectionRouter = Router();

connectionRouter.get(
  "/random",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.connectionPuzzle.count();
      if (count === 0) {
        res.json({ data: null });
        return;
      }
      const skip = Math.floor(Math.random() * count);
      const puzzle = await prisma.connectionPuzzle.findFirst({ skip });
      res.json({ data: puzzle });
    } catch (err) {
      next(err);
    }
  }
);

connectionRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await prisma.connectionPuzzle.count();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);
