import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const scoreRouter = Router();

const scoreSchema = z.object({
  userId: z.string().uuid().optional(),
  anonymousId: z.string().optional(),
  mode: z.enum(["who-am-i", "stat-attack", "quick-fire", "higher-or-lower"]),
  score: z.number().int().min(0),
  details: z.record(z.unknown()),
});

scoreRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = scoreSchema.parse(req.body);
      const session = await prisma.gameSession.create({
        data: {
          userId: body.userId,
          anonymousId: body.anonymousId,
          mode: body.mode,
          score: body.score,
          details: body.details as object,
        },
      });
      res.status(201).json({ data: session });
    } catch (err) {
      next(err);
    }
  }
);
