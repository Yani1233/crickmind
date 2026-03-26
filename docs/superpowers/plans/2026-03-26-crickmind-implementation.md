# CrickMind Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-mode cricket quiz game (CrickMind) with 4 game modes, a Node.js/Express API, PostgreSQL database, and React frontend.

**Architecture:** Monorepo with `client/` (React+Vite+Tailwind), `server/` (Express+Prisma+PostgreSQL), `shared/` (types), and `scripts/` (data pipeline). Frontend fetches from REST API. All data in PostgreSQL, managed via Prisma ORM.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, TanStack Query, Node.js, Express, Prisma, PostgreSQL

**Spec:** `docs/superpowers/specs/2026-03-26-crickmind-design.md`

---

## Chunk 1: Project Scaffolding & Database

### Task 1: Initialize Monorepo Root

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.base.json`

- [ ] **Step 1: Initialize git and root package.json**

```bash
cd /Users/arunraja/Documents/quiz
git init
```

Create `package.json`:
```json
{
  "name": "crickmind",
  "private": true,
  "workspaces": ["client", "server", "shared", "scripts"],
  "scripts": {
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "build": "cd client && npm run build && cd ../server && npm run build"
  },
  "devDependencies": {
    "concurrently": "^9.1.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.superpowers/
```

- [ ] **Step 3: Create base tsconfig**

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Install root dependencies**

```bash
npm install
```

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore tsconfig.base.json
git commit -m "chore: initialize monorepo root"
```

---

### Task 2: Shared Types Package

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/types.ts`

- [ ] **Step 1: Create shared package structure**

`shared/package.json`:
```json
{
  "name": "@crickmind/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/types.ts",
  "types": "./src/types.ts"
}
```

`shared/tsconfig.json`:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Define all shared types**

`shared/src/types.ts`:
```typescript
// Player types
export type Role = "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
export type BattingHand = "Right" | "Left";
export type BowlingStyle =
  | "Right-arm fast" | "Right-arm medium"
  | "Left-arm fast" | "Left-arm medium"
  | "Off-spin" | "Leg-spin"
  | "Left-arm orthodox" | "Left-arm wrist spin"
  | "None";
export type Format = "Test" | "ODI" | "T20I" | "IPL";
export type PopularityTier = 1 | 2 | 3 | 4;
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionCategory = "Records" | "WorldCup" | "IPL" | "Debuts" | "Milestones";
export type FormatTag = "Test" | "ODI" | "T20I" | "IPL" | "General";
export type GameMode = "who-am-i" | "stat-attack" | "quick-fire" | "higher-or-lower";

export interface Player {
  id: string;
  name: string;
  country: string;
  role: Role;
  formats: Format[];
  battingHand: BattingHand;
  bowlingStyle: BowlingStyle;
  popularityTier: PopularityTier;
  bornYear: number;
  debutYear: number;
  retired: boolean;
  totalMatches: number;
  totalRuns: number;
  battingAvg: number;
  strikeRate: number;
  totalWickets: number;
  bowlingAvg: number;
  economyRate: number;
  iplTeam: string;
  photoUrl: string | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: QuestionCategory;
  difficulty: Difficulty;
  formatTag: FormatTag;
}

// Who Am I types
export type MatchResult = "green" | "yellow" | "gray";

export interface AttributeGuessResult {
  attribute: string;
  value: string;
  result: MatchResult;
  direction?: "up" | "down"; // for numeric attributes
}

export interface WhoAmIGuess {
  player: Player;
  results: AttributeGuessResult[];
}

// Stat Attack types
export interface StatReveal {
  label: string;
  value: number | string;
}

// Higher or Lower types
export interface PlayerPair {
  playerA: Player;
  playerB: Player;
  statCategory: string;
  statKey: keyof Player;
}

// Quick Fire types
export interface QuickFireResult {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
  timeTaken: number;
  points: number;
}

// Scoring
export interface GameResult {
  mode: GameMode;
  score: number;
  details: Record<string, unknown>;
  completedAt: string;
}

// API response envelope
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code: string;
}

// Region mapping for Who Am I
export const REGION_MAP: Record<string, string> = {
  IND: "South Asia", PAK: "South Asia", SL: "South Asia",
  BAN: "South Asia", AFG: "South Asia", NEP: "South Asia",
  AUS: "Oceania", NZ: "Oceania",
  ENG: "British Isles", IRE: "British Isles", SCO: "British Isles",
  SA: "Southern Africa", ZIM: "Southern Africa",
  WI: "Caribbean",
};

// Role adjacency for Who Am I
export const ROLE_ADJACENCY: Record<Role, Role[]> = {
  "Batsman": ["All-rounder", "Wicket-keeper"],
  "Bowler": ["All-rounder"],
  "All-rounder": ["Batsman", "Bowler"],
  "Wicket-keeper": ["Batsman"],
};
```

- [ ] **Step 3: Commit**

```bash
git add shared/
git commit -m "feat: add shared types package"
```

---

### Task 3: Backend Scaffolding + Prisma Schema

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/prisma/schema.prisma`
- Create: `server/src/index.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/.env`

- [ ] **Step 1: Create server package.json**

```json
{
  "name": "@crickmind/server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx ../scripts/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.4.0",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "express-rate-limit": "^7.5.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "prisma": "^6.4.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create server tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

- [ ] **Step 3: Create Prisma schema**

`server/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Player {
  id             String   @id @default(uuid())
  name           String
  country        String
  role           String
  formats        String[]
  battingHand    String   @map("batting_hand")
  bowlingStyle   String   @map("bowling_style")
  popularityTier Int      @default(3) @map("popularity_tier")
  bornYear       Int      @map("born_year")
  debutYear      Int      @map("debut_year")
  retired        Boolean  @default(false)
  totalMatches   Int      @map("total_matches")
  totalRuns      Int      @map("total_runs")
  battingAvg     Float    @map("batting_avg")
  strikeRate     Float    @map("strike_rate")
  totalWickets   Int      @map("total_wickets")
  bowlingAvg     Float    @map("bowling_avg")
  economyRate    Float    @default(0) @map("economy_rate")
  iplTeam        String   @default("None") @map("ipl_team")
  photoUrl       String?  @map("photo_url")
  verified       Boolean  @default(false)
  source         String   @default("manual")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("players")
}

model QuizQuestion {
  id            String   @id @default(uuid())
  question      String
  options       Json
  correctAnswer Int      @map("correct_answer")
  category      String
  difficulty    String
  formatTag     String   @map("format_tag")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("quiz_questions")
}

model GameSession {
  id          String   @id @default(uuid())
  anonymousId String?  @map("anonymous_id")
  mode        String
  score       Int
  details     Json
  completedAt DateTime @default(now()) @map("completed_at")

  @@map("game_sessions")
}
```

- [ ] **Step 4: Create .env file**

`server/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crickmind?schema=public"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

- [ ] **Step 5: Create error handler middleware**

`server/src/middleware/errorHandler.ts`:
```typescript
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
```

- [ ] **Step 6: Create Express server entry point**

`server/src/index.ts`:
```typescript
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";

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

// Routes will be added in subsequent tasks

app.use(errorHandler);

app.listen(port, () => {
  console.log(`CrickMind server running on port ${port}`);
});

export default app;
```

- [ ] **Step 7: Install dependencies and run initial migration**

```bash
cd server && npm install
npx prisma migrate dev --name init
```

- [ ] **Step 8: Verify server starts**

```bash
npm run dev
# Expected: "CrickMind server running on port 3001"
# Hit Ctrl+C to stop
```

- [ ] **Step 9: Commit**

```bash
cd /Users/arunraja/Documents/quiz
git add server/ shared/
git commit -m "feat: scaffold backend with Prisma schema and Express server"
```

---

### Task 4: Seed Data Script

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/tsconfig.json`

- [ ] **Step 1: Create scripts tsconfig**

`scripts/tsconfig.json`:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["."]
}
```

- [ ] **Step 2: Create seed script with ~200 players and ~100 quiz questions**

`scripts/seed.ts` — this file will contain curated cricket data for:
- 200 verified players across all formats (legends like Sachin, Bradman; current stars like Kohli, Smith; lesser-known like Mushfiqur, Tamim; retired greats like Warne, Murali, Lara, etc.)
- 100 quiz questions across all categories (Records, WorldCup, IPL, Debuts, Milestones) and difficulties (easy/medium/hard)
- Uses Prisma client to upsert all records

The seed data should include a diverse mix:
- Players from IND, AUS, ENG, PAK, SA, NZ, SL, WI, AFG, BAN
- All roles: Batsman, Bowler, All-rounder, Wicket-keeper
- Mix of retired and active players
- All popularity tiers (1-4)
- Accurate stats from public cricket records

Write the full seed script with embedded data arrays for players and questions, using `prisma.player.upsert()` and `prisma.quizQuestion.upsert()` with `name` / `question` as unique identifiers. Include `economyRate` for bowlers.

Players should span: IND, AUS, ENG, PAK, SA, NZ, SL, WI, BAN, AFG, ZIM, IRE. All roles. All popularity tiers. Mix of retired and active. Caribbean players should use "WI" as country code.

- [ ] **Step 3: Run the seed**

```bash
cd server && npm run db:seed
```

- [ ] **Step 4: Verify data in database**

```bash
npx prisma studio
# Check players table has ~200 rows, quiz_questions has ~100 rows
```

- [ ] **Step 5: Commit**

```bash
cd /Users/arunraja/Documents/quiz
git add scripts/
git commit -m "feat: add seed script with 200 players and 100 quiz questions"
```

---

### Task 4b: Data Ingestion & Curation Pipeline

**Files:**
- Create: `scripts/ingest.ts`
- Create: `scripts/curate.ts`
- Add: `PlayersRaw` model to `server/prisma/schema.prisma`

- [ ] **Step 1: Add PlayersRaw model to Prisma schema**

```prisma
model PlayersRaw {
  id             String   @id @default(uuid())
  name           String
  country        String
  role           String?
  formats        String[]
  battingHand    String?  @map("batting_hand")
  bowlingStyle   String?  @map("bowling_style")
  bornYear       Int?     @map("born_year")
  debutYear      Int?     @map("debut_year")
  retired        Boolean?
  totalMatches   Int?     @map("total_matches")
  totalRuns      Int?     @map("total_runs")
  battingAvg     Float?   @map("batting_avg")
  strikeRate     Float?   @map("strike_rate")
  totalWickets   Int?     @map("total_wickets")
  bowlingAvg     Float?   @map("bowling_avg")
  economyRate    Float?   @map("economy_rate")
  iplTeam        String?  @map("ipl_team")
  source         String
  rawData        Json?    @map("raw_data")
  verified       Boolean  @default(false)
  createdAt      DateTime @default(now()) @map("created_at")

  @@map("players_raw")
}
```

Run migration: `npx prisma migrate dev --name add-players-raw`

- [ ] **Step 2: Create ingest script**

`scripts/ingest.ts`:
- Fetches player data from CricAPI (or reads from a local JSON dump)
- Inserts into `players_raw` table with `source: "cricapi"`
- Handles API rate limits and pagination
- Skips players already in `players_raw` (by name match)

- [ ] **Step 3: Create curation script**

`scripts/curate.ts`:
- CLI tool that lists unverified `players_raw` records
- Shows each player's data and asks for confirmation (y/n/edit)
- On approve: copies to `players` table with `verified: true`, fills in `popularityTier`
- On reject: marks as `verified: false` in `players_raw` (skipped in future)

- [ ] **Step 4: Commit**

```bash
git add scripts/ server/prisma/
git commit -m "feat: add data ingestion and curation pipeline"
```

---

## Chunk 2: Backend API Routes

### Task 5: Player Search Endpoint

**Files:**
- Create: `server/src/routes/players.ts`
- Create: `server/src/services/playerService.ts`
- Modify: `server/src/index.ts` (register routes)

- [ ] **Step 1: Create player service**

`server/src/services/playerService.ts`:
- `searchPlayers(query: string, limit?: number)` — case-insensitive `ILIKE` search on `name`, `verified = true`, returns `id, name, country`, limit 10
- `getRandomPlayer(excludeIds?: string[])` — random verified player, excluding provided IDs. Frontend tracks last 20 played player IDs in state and sends them as `excludeIds` query param.
- `getPlayerById(id: string)` — full player record
- `getPlayerPair(streak: number)` — two verified players + a random stat category, respecting difficulty tiers based on streak
- `getNextChallenger(currentId: string, streak: number)` — single new challenger for Higher or Lower
- `getPlayerStats(id: string, revealIndex: number)` — returns stats up to `revealIndex`, role-aware stat pool

All methods use Prisma client. All return only verified players.

- [ ] **Step 2: Create player routes**

`server/src/routes/players.ts`:
- `GET /search?q=` → `playerService.searchPlayers(q)`
- `GET /random` → `playerService.getRandomPlayer()`
- `GET /pair` → `playerService.getPlayerPair(0)`
- `GET /next-challenger?current_id=X&streak=N` → `playerService.getNextChallenger(currentId, streak)`
- `GET /:id/stats?reveal=N` → `playerService.getPlayerStats(id, reveal)`

Validate query params with Zod. Return `ApiResponse<T>` on success, `ApiError` on failure.

- [ ] **Step 3: Register routes in index.ts**

Add to `server/src/index.ts`:
```typescript
import { playerRouter } from "./routes/players.js";
app.use("/api/players", playerRouter);
```

- [ ] **Step 4: Test endpoints manually**

```bash
# Start server
npm run dev

# In another terminal:
curl http://localhost:3001/api/players/search?q=sachin
curl http://localhost:3001/api/players/random
curl http://localhost:3001/api/players/pair
curl http://localhost:3001/api/health
```

- [ ] **Step 5: Commit**

```bash
git add server/src/
git commit -m "feat: add player API routes (search, random, pair, stats)"
```

---

### Task 6: Quiz Questions Endpoint

**Files:**
- Create: `server/src/routes/questions.ts`
- Create: `server/src/services/questionService.ts`
- Modify: `server/src/index.ts` (register routes)

- [ ] **Step 1: Create question service**

`server/src/services/questionService.ts`:
- `getQuestions(count: number, category?: string, difficulty?: string)` — random questions matching filters. Falls back to all categories if none match. Returns array of `QuizQuestion`.

- [ ] **Step 2: Create question routes**

`server/src/routes/questions.ts`:
- `GET /` → query params: `count` (default 10), `category` (optional), `difficulty` (optional)

- [ ] **Step 3: Register in index.ts**

```typescript
import { questionRouter } from "./routes/questions.js";
app.use("/api/questions", questionRouter);
```

- [ ] **Step 4: Test endpoint**

```bash
curl "http://localhost:3001/api/questions?count=5"
curl "http://localhost:3001/api/questions?category=IPL&difficulty=easy"
```

- [ ] **Step 5: Commit**

```bash
git add server/src/
git commit -m "feat: add quiz questions API route"
```

---

### Task 7: Scores Endpoint

**Files:**
- Create: `server/src/routes/scores.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Create scores route**

`server/src/routes/scores.ts`:
- `POST /` — accepts `{ anonymousId?, mode, score, details }`, validates with Zod, saves to `game_sessions` table

- [ ] **Step 2: Register and test**

```bash
curl -X POST http://localhost:3001/api/scores \
  -H "Content-Type: application/json" \
  -d '{"mode":"quick-fire","score":85,"details":{"correct":8,"total":10}}'
```

- [ ] **Step 3: Commit**

```bash
git add server/src/
git commit -m "feat: add scores API route"
```

---

## Chunk 3: Frontend Scaffolding & Shared Components

### Task 8: Scaffold React Frontend

**Files:**
- Create: `client/` (Vite scaffold)
- Modify: `client/package.json` (add dependencies)
- Create: `client/tailwind.config.ts`
- Create: `client/src/App.tsx`
- Create: `client/src/main.tsx`

- [ ] **Step 1: Create Vite React project**

```bash
cd /Users/arunraja/Documents/quiz
npm create vite@latest client -- --template react-ts
cd client
npm install
```

- [ ] **Step 2: Install frontend dependencies**

```bash
npm install react-router-dom @tanstack/react-query framer-motion
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Tailwind**

Update `client/vite.config.ts` to include Tailwind plugin.

Update `client/src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: Configure API proxy in Vite**

`client/vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

- [ ] **Step 5: Set up React Router and TanStack Query**

`client/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Hub } from "./pages/Hub";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hub />} />
          {/* Game mode routes added in subsequent tasks */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: Verify frontend starts**

```bash
npm run dev
# Expected: Vite dev server on http://localhost:5173
```

- [ ] **Step 7: Commit**

```bash
cd /Users/arunraja/Documents/quiz
git add client/
git commit -m "feat: scaffold React frontend with Vite, Tailwind, React Router"
```

---

### Task 9: API Client + Shared Hooks

**Files:**
- Create: `client/src/api/client.ts`
- Create: `client/src/api/players.ts`
- Create: `client/src/api/questions.ts`
- Create: `client/src/hooks/useLocalScore.ts`
- Create: `client/src/hooks/useTimer.ts`

- [ ] **Step 1: Create base API client**

`client/src/api/client.ts` — thin fetch wrapper that:
- Prepends `/api` to paths
- Parses JSON responses
- Throws on non-2xx with `ApiError` shape

- [ ] **Step 2: Create player API hooks**

`client/src/api/players.ts` — TanStack Query hooks:
- `usePlayerSearch(query: string)` — debounced search, enabled only when query.length >= 2
- `useRandomPlayer()` — fetches random player, `refetch` to get new one
- `usePlayerPair()` — initial pair for Higher or Lower
- `useNextChallenger(currentId, streak)` — next challenger
- `usePlayerStats(id, revealIndex)` — progressive stat reveal

- [ ] **Step 3: Create questions API hook**

`client/src/api/questions.ts`:
- `useQuizQuestions(count, category?, difficulty?)` — fetches quiz questions. Handles empty response by showing "No questions available" with back-to-hub button.

- [ ] **Step 4: Create useLocalScore hook**

`client/src/hooks/useLocalScore.ts` — manages localStorage:
- Read/write high scores per mode
- Read/write total cumulative score
- Read/write games played count

- [ ] **Step 5: Create useTimer hook**

`client/src/hooks/useTimer.ts`:
- `useTimer(durationSeconds)` — returns `{ timeLeft, elapsed, isExpired, reset }`
- Uses `requestAnimationFrame` for smooth countdown
- Calls `onExpire` callback when time runs out

- [ ] **Step 6: Commit**

```bash
git add client/src/api/ client/src/hooks/
git commit -m "feat: add API client hooks and shared game hooks"
```

---

### Task 10: Shared UI Components

**Files:**
- Create: `client/src/components/Header.tsx`
- Create: `client/src/components/PlayerSearchInput.tsx`
- Create: `client/src/components/PlayerCard.tsx`
- Create: `client/src/components/ScorePopup.tsx`
- Create: `client/src/components/TimerBar.tsx`
- Create: `client/src/components/ResultScreen.tsx`

- [ ] **Step 1: Build Header component**

Fixed top bar with: back button (left), mode title (center), score/streak display (right). Uses Framer Motion for score number animation.

- [ ] **Step 2: Build PlayerSearchInput**

Autocomplete input using `usePlayerSearch`. Shows dropdown with player name + country flag emoji. Debounced at 300ms. "No players found" empty state.

- [ ] **Step 3: Build PlayerCard**

Displays player photo (or initials placeholder), name, country flag, role, and key stats. Used for reveals and Higher or Lower. Framer Motion for flip/slide animations.

- [ ] **Step 4: Build ScorePopup**

Floating "+X pts" text that animates upward and fades out. Triggered via a `useScorePopup` hook that returns `{ show, triggerPopup }`.

- [ ] **Step 5: Build TimerBar**

Horizontal bar from 100% to 0% width. Color transitions: green (>50%) → yellow (25-50%) → red (<25%). Smooth CSS transition.

- [ ] **Step 6: Build ResultScreen**

Generic end-of-game screen: score display, mode-specific stats (passed as props), "Play Again" button, "Back to Hub" button. Confetti animation on high scores (using Framer Motion).

- [ ] **Step 7: Commit**

```bash
git add client/src/components/
git commit -m "feat: add shared UI components (Header, PlayerSearch, PlayerCard, Timer, Results)"
```

---

### Task 11: Hub Page

**Files:**
- Create: `client/src/pages/Hub.tsx`
- Create: `client/src/components/ModeCard.tsx`

- [ ] **Step 1: Build ModeCard component**

Card with: icon (emoji), mode name, one-line description, high score badge. Hover animation (scale up slightly). Click navigates to mode route.

- [ ] **Step 2: Build Hub page**

- CrickMind title with cricket ball icon
- Total score display
- 2x2 grid of ModeCards (responsive: 1 col on mobile)
- Dark theme: bg `#1A1A2E`, cards `#16213E`, accent green `#1B5E20`, gold `#FFD600`
- Four modes: Who Am I?, Stat Attack, Quick Fire, Higher or Lower
- **Error handling:** On API unreachable, show "Connection error — check your internet" banner with retry button. All mode cards disabled until API responds. Use a health check query on mount.
- **Mode availability:** Check player count via API. If fewer than 2 verified players, disable Higher or Lower with "Coming soon" badge. If 0 players, disable Who Am I and Stat Attack too. Quick Fire disabled if 0 quiz questions.

- [ ] **Step 3: Verify hub renders**

```bash
npm run dev
# Open http://localhost:5173 — should see the hub with 4 mode cards
```

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/ client/src/components/ModeCard.tsx
git commit -m "feat: add Hub page with game mode cards"
```

---

## Chunk 4: Game Mode — Who Am I?

### Task 12: Who Am I? — Match Logic

**Files:**
- Create: `client/src/utils/matchLogic.ts`
- Create: `client/src/utils/matchLogic.test.ts`

- [ ] **Step 1: Write tests for match logic**

Test all attribute comparisons from the spec:
- Nation: same country (green), same region (yellow), different region (gray)
- Role: same (green), adjacent (yellow), unrelated (gray)
- Format: same (green), overlapping (yellow), none shared (gray)
- Batting Hand: same (green), different (gray) — no yellow
- Born Year: same (green), within 3 (yellow), >3 (gray) + direction
- Total Matches: same (green), within 50 (yellow), >50 (gray) + direction
- IPL Team: same (green), both have teams but different (yellow), one is None (gray)

- [ ] **Step 2: Run tests — should FAIL**

```bash
npx vitest run src/utils/matchLogic.test.ts
```

- [ ] **Step 3: Implement match logic**

`client/src/utils/matchLogic.ts`:
- `compareAttribute(attribute, guessValue, targetValue)` → `{ result: MatchResult, direction?: "up" | "down" }`
- `comparePlayer(guess: Player, target: Player)` → `AttributeGuessResult[]`
- Uses `REGION_MAP` and `ROLE_ADJACENCY` from shared types

- [ ] **Step 4: Run tests — should PASS**

```bash
npx vitest run src/utils/matchLogic.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/
git commit -m "feat: implement Who Am I attribute match logic with tests"
```

---

### Task 13: Who Am I? — Game Component

**Files:**
- Create: `client/src/modes/WhoAmI/WhoAmIGame.tsx`
- Create: `client/src/modes/WhoAmI/GuessRow.tsx`
- Create: `client/src/modes/WhoAmI/AttributeCell.tsx`
- Modify: `client/src/App.tsx` (add route)

- [ ] **Step 1: Build AttributeCell**

Single cell showing attribute value + color background + accessibility icon (checkmark/tilde/X). Optional arrow indicator for numeric attributes.

- [ ] **Step 2: Build GuessRow**

A row of AttributeCells for one guess. Animates in from bottom using Framer Motion `motion.div` with stagger.

- [ ] **Step 3: Build WhoAmIGame**

Main game component:
- Fetches random player via `useRandomPlayer()`
- PlayerSearchInput at top for guessing
- On submit: compare guess vs target using `comparePlayer()`, add GuessRow
- Track guesses (max 8), show guess counter as cricket ball icons
- On correct guess or 8th guess: show ResultScreen with PlayerCard
- Score calculation: `9 - guessNumber` (1-indexed)
- Update local storage scores

- [ ] **Step 4: Add route in App.tsx**

```tsx
<Route path="/who-am-i" element={<WhoAmIGame />} />
```

- [ ] **Step 5: Test manually**

Play a full game in the browser. Verify:
- Autocomplete works
- Colors are correct for green/yellow/gray
- Arrows show for numeric attributes
- Win/loss states work
- Score updates

- [ ] **Step 6: Commit**

```bash
git add client/src/modes/WhoAmI/ client/src/App.tsx
git commit -m "feat: implement Who Am I game mode"
```

---

## Chunk 5: Game Mode — Stat Attack

### Task 14: Stat Attack Game

**Files:**
- Create: `client/src/modes/StatAttack/StatAttackGame.tsx`
- Create: `client/src/modes/StatAttack/StatCard.tsx`
- Modify: `client/src/App.tsx` (add route)

- [ ] **Step 1: Build StatCard**

Displays a single stat (label + value) with 3D flip animation on reveal. Uses Framer Motion `rotateY` transition.

- [ ] **Step 2: Build StatAttackGame**

Main game component:
- Fetches random player via `useRandomPlayer()`
- Shows "?" silhouette card
- "Reveal Next Stat" button — reveals stats one at a time using role-aware stat pool
- After each reveal: PlayerSearchInput appears for guessing
- On correct guess: show PlayerCard + score. On all 4 revealed + wrong: show answer.
- Scoring: 5 - revealCount (so 4pts for 1 reveal, 1pt for 4)

- [ ] **Step 3: Add route**

```tsx
<Route path="/stat-attack" element={<StatAttackGame />} />
```

- [ ] **Step 4: Test manually and commit**

```bash
git add client/src/modes/StatAttack/ client/src/App.tsx
git commit -m "feat: implement Stat Attack game mode"
```

---

## Chunk 6: Game Mode — Quick Fire

### Task 15: Quick Fire Game

**Files:**
- Create: `client/src/modes/QuickFire/QuickFireGame.tsx`
- Create: `client/src/modes/QuickFire/QuestionCard.tsx`
- Create: `client/src/utils/scoring.ts`
- Modify: `client/src/App.tsx` (add route)

- [ ] **Step 1: Create scoring utility**

`client/src/utils/scoring.ts`:
```typescript
export function calculateSpeedBonus(elapsedSeconds: number): number {
  return Math.max(0, Math.round(5 * (15 - elapsedSeconds) / 12));
}
```

Plus a test for this function.

- [ ] **Step 2: Build QuestionCard**

Full-screen card with question text, 4 option buttons, TimerBar (15s). On answer: green flash for correct, red shake for wrong + show correct answer. Auto-advance after 1.5s.

- [ ] **Step 3: Build QuickFireGame**

Main game component:
- Fetches 10 questions via `useQuizQuestions(10)`
- Cycles through QuestionCards
- Tracks: answers, time per question, score per question
- Timer per question (15s) — auto-wrong on expire
- End screen: cricket scorecard style (total score, accuracy %, fastest answer, breakdown)

- [ ] **Step 4: Add route, test, commit**

```bash
git add client/src/modes/QuickFire/ client/src/utils/scoring.ts client/src/App.tsx
git commit -m "feat: implement Quick Fire trivia game mode"
```

---

## Chunk 7: Game Mode — Higher or Lower

### Task 16: Higher or Lower Game

**Files:**
- Create: `client/src/modes/HigherOrLower/HigherOrLowerGame.tsx`
- Create: `client/src/modes/HigherOrLower/VersusCard.tsx`
- Modify: `client/src/App.tsx` (add route)

- [ ] **Step 1: Build VersusCard**

Two PlayerCards side-by-side with "VS" and stat category label between them. Each card is clickable. Framer Motion: loser slides out left, new challenger slides in from right.

- [ ] **Step 2: Build HigherOrLowerGame**

Main game component:
- Fetches initial pair via `usePlayerPair()`
- Shows VersusCard with stat category
- On click: reveal both stats, animate correct/wrong
- Correct: fetch next challenger, increment streak
- Wrong: show ResultScreen with final streak
- Fire animation at streak 5+ (emoji + pulse animation)

- [ ] **Step 3: Add route, test, commit**

```bash
git add client/src/modes/HigherOrLower/ client/src/App.tsx
git commit -m "feat: implement Higher or Lower game mode"
```

---

## Chunk 8: Polish & Integration

### Task 17: Animations & Theme Polish

**Files:**
- Modify: `client/src/index.css` (global dark theme styles)
- Create: `client/src/components/Confetti.tsx`
- Modify: various mode components (add animations)

- [ ] **Step 1: Set up global dark theme**

Root CSS variables and Tailwind theme extension for the CrickMind color palette:
- Background: `#1A1A2E`
- Card surface: `#16213E`
- Primary green: `#1B5E20`
- Accent gold: `#FFD600`
- Match green: `#4CAF50`
- Match yellow: `#FFC107`
- Match gray: `#9E9E9E`

- [ ] **Step 2: Add Confetti component**

Simple confetti animation using Framer Motion — colored circles that burst and fall. Used on wins and perfect scores.

- [ ] **Step 3: Add page transitions**

Wrap Routes with `AnimatePresence` and add slide transitions between pages.

- [ ] **Step 4: Verify all modes look polished**

Open each mode, play through, check:
- Dark theme is consistent
- Animations are smooth
- Mobile responsive (check at 375px width)
- Score updates work across modes
- Hub shows correct high scores

- [ ] **Step 5: Commit**

```bash
git add client/
git commit -m "feat: add dark theme, confetti, page transitions, and UI polish"
```

---

### Task 18: End-to-End Smoke Test

- [ ] **Step 1: Start both servers**

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

- [ ] **Step 2: Play through all 4 modes**

1. Hub loads with 4 mode cards
2. Who Am I: search, guess, verify colors, win/lose
3. Stat Attack: reveal stats, guess, verify scoring
4. Quick Fire: answer 10 questions, verify timer and scoring
5. Higher or Lower: play streak, verify card transitions

- [ ] **Step 3: Verify local storage persistence**

- Play a round, check scores on hub
- Refresh page, scores should persist
- Play another round, total score should update

- [ ] **Step 4: Fix any issues found**

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: CrickMind v1 — 4-mode cricket quiz game"
```
