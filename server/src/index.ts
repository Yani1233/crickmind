import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import { playerRouter } from "./routes/players.js";
import { questionRouter } from "./routes/questions.js";
import { scoreRouter } from "./routes/scores.js";
import { userRouter } from "./routes/users.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { roomRouter } from "./routes/rooms.js";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/players", playerRouter);
app.use("/api/questions", questionRouter);
app.use("/api/scores", scoreRouter);
app.use("/api/users", userRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/rooms", roomRouter);

app.use(errorHandler);

// Only listen when running directly (not as serverless function)
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`CrickMind server running on port ${port}`);
  });
}

export default app;
