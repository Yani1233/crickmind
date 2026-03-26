import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createOrGetUser, getUserProfile } from "../services/userService.js";

export const userRouter = Router();

const createUserSchema = z.object({
  email: z.string().email().max(100).trim(),
  displayName: z.string().min(2).max(30).trim(),
});

userRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, displayName } = createUserSchema.parse(req.body);
    const result = await createOrGetUser(email, displayName);
    res.status(result.isNew ? 201 : 200).json({ data: result });
  } catch (err) { next(err); }
});

userRouter.get("/:id/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getUserProfile(req.params.id as string);
    res.json({ data: profile });
  } catch (err) { next(err); }
});
