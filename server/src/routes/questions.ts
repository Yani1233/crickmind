import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getQuestions, getQuestionCount } from "../services/questionService.js";

export const questionRouter = Router();

questionRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = req.query.count
        ? z.coerce.number().int().min(1).max(50).parse(req.query.count)
        : 10;
      const category = req.query.category as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;
      const questions = await getQuestions(count, category, difficulty);
      res.json({ data: questions });
    } catch (err) {
      next(err);
    }
  }
);

questionRouter.get(
  "/count",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await getQuestionCount();
      res.json({ data: { count } });
    } catch (err) {
      next(err);
    }
  }
);
