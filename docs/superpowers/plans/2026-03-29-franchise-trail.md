# Franchise Trail Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Franchise Trail" game mode where players guess an IPL cricketer from their franchise history revealed one stint at a time.

**Architecture:** New Prisma model `IplCareer` stores franchise history as JSON stints. Express route serves random careers. React component follows the StatAttack pattern with progressive reveal, 5 rounds, and autocomplete guessing.

**Tech Stack:** React 18, TypeScript, Framer Motion, Express, Prisma, PostgreSQL, Zod

**Spec:** `docs/superpowers/specs/2026-03-29-franchise-trail-design.md`

---

## Chunk 1: Data Layer (Schema + Seed Data + API)

### Task 1: Add Shared Types

**Files:**
- Modify: `shared/src/types.ts`

- [ ] **Step 1: Add IplStint and IplCareerData interfaces**

Add after the `StatReveal` interface (line 86):

```typescript
// Franchise Trail types
export interface IplStint {
  team: string;
  startYear: number;
  endYear: number;
}

export interface IplCareerData {
  playerName: string;
  stints: IplStint[];
  totalTeams: number;
}
```

- [ ] **Step 2: Update GameMode union**

Add `"franchise-trail"` to the `GameMode` type (line 24-32):

```typescript
export type GameMode =
  | "who-am-i"
  | "stat-attack"
  | "quick-fire"
  | "higher-or-lower"
  | "connections"
  | "timeline"
  | "mystery-xi"
  | "auction-arena"
  | "franchise-trail";
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/arunraja/Documents/quiz && npx tsc --noEmit -p shared/tsconfig.json 2>&1 || echo "No tsconfig in shared, check manually"`

---

### Task 2: Add Prisma Model + Migration

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: Add IplCareer model to schema**

Add after the `AuctionEntry` model (line 157):

```prisma
model IplCareer {
  id         String   @id @default(uuid())
  playerName String   @unique @map("player_name")
  stints     Json
  totalTeams Int      @map("total_teams")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("ipl_careers")
}
```

- [ ] **Step 2: Run Prisma migration**

Run: `cd /Users/arunraja/Documents/quiz/server && npx prisma migrate dev --name add-ipl-careers`
Expected: Migration creates `ipl_careers` table successfully.

- [ ] **Step 3: Verify Prisma client generated**

Run: `cd /Users/arunraja/Documents/quiz/server && npx prisma generate`

---

### Task 3: Create Seed Data File

**Files:**
- Create: `scripts/data/ipl-careers.json`

- [ ] **Step 1: Create curated IPL career data**

Create `scripts/data/ipl-careers.json` with 100+ players who have played for 2+ IPL teams. Each entry:

```json
[
  {
    "playerName": "MS Dhoni",
    "stints": [
      {"team": "CSK", "startYear": 2008, "endYear": 2015},
      {"team": "RPS", "startYear": 2016, "endYear": 2017},
      {"team": "CSK", "startYear": 2018, "endYear": 2024}
    ]
  },
  {
    "playerName": "Virat Kohli",
    "stints": [
      {"team": "RCB", "startYear": 2008, "endYear": 2025}
    ]
  }
]
```

Note: Only include players with 2+ stints (different teams or same team with a gap). Virat Kohli above is an example of what NOT to include (single stint). The data must be researched and accurate.

Key players to include (examples of interesting franchise trails):
- Ravindra Jadeja: RR -> KTK -> CSK -> CSK
- KL Rahul: RCB -> SRH -> PBKS -> LSG
- Robin Uthappa: MI -> RCB -> PWI -> KKR -> RR -> CSK
- Mitchell Starc: RCB -> KKR -> DC
- Glenn Maxwell: MI -> PBKS -> RCB
- David Warner: DD -> SRH -> DC -> DD
- Shikhar Dhawan: DD -> SRH -> DC -> PBKS
- Ajinkya Rahane: MI -> RR -> DC -> KKR -> CSK
- And 90+ more with verified data

- [ ] **Step 2: Validate JSON structure**

Run: `cd /Users/arunraja/Documents/quiz && node -e "const d=require('./scripts/data/ipl-careers.json'); console.log(d.length + ' players loaded'); const multi = d.filter(p => p.stints.length >= 2); console.log(multi.length + ' with 2+ stints');"`

---

### Task 4: Create Seed Script

**Files:**
- Create: `scripts/seed-ipl-careers.ts`

- [ ] **Step 1: Write the seed script**

```typescript
import { PrismaClient } from "@prisma/client";
import iplCareers from "./data/ipl-careers.json";

const prisma = new PrismaClient();

interface Stint {
  team: string;
  startYear: number;
  endYear: number;
}

interface CareerEntry {
  playerName: string;
  stints: Stint[];
}

async function seed() {
  const careers = iplCareers as CareerEntry[];
  const multiStint = careers.filter((c) => c.stints.length >= 2);

  console.log(`Seeding ${multiStint.length} IPL careers...`);

  let upserted = 0;
  for (const career of multiStint) {
    const distinctTeams = new Set(career.stints.map((s) => s.team));
    await prisma.iplCareer.upsert({
      where: { playerName: career.playerName },
      update: {
        stints: career.stints,
        totalTeams: distinctTeams.size,
      },
      create: {
        playerName: career.playerName,
        stints: career.stints,
        totalTeams: distinctTeams.size,
      },
    });
    upserted++;
  }

  console.log(`Done: ${upserted} careers upserted.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run the seed script**

Run: `cd /Users/arunraja/Documents/quiz && npx tsx scripts/seed-ipl-careers.ts`
Expected: "Seeding X IPL careers... Done: X careers upserted."

- [ ] **Step 3: Verify data in database**

Run: `psql -d crickmind -c "SELECT player_name, total_teams, jsonb_array_length(stints::jsonb) as stint_count FROM ipl_careers ORDER BY total_teams DESC LIMIT 10;"`

---

### Task 5: Create API Route

**Files:**
- Create: `server/src/routes/franchiseTrail.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Create the franchise trail route**

Create `server/src/routes/franchiseTrail.ts`:

```typescript
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
```

- [ ] **Step 2: Register route in server index**

Add to `server/src/index.ts`:

Import (after line 14):
```typescript
import { franchiseTrailRouter } from "./routes/franchiseTrail.js";
```

Mount (after line 43):
```typescript
app.use("/api/franchise-trail", franchiseTrailRouter);
```

- [ ] **Step 3: Verify API works**

Run: `curl -s http://localhost:3002/api/franchise-trail/random | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{const j=JSON.parse(d); console.log(j.data.playerName, j.data.stints.length+' stints')})"`
Expected: A player name with stint count.

- [ ] **Step 4: Verify exclusion works**

Run: `curl -s "http://localhost:3002/api/franchise-trail/random?exclude=MS%20Dhoni" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{const j=JSON.parse(d); console.log(j.data.playerName, '(should not be MS Dhoni)')})"`

- [ ] **Step 5: Commit data layer**

```bash
git add server/prisma/schema.prisma server/prisma/migrations/ server/src/routes/franchiseTrail.ts server/src/index.ts shared/src/types.ts scripts/data/ipl-careers.json scripts/seed-ipl-careers.ts
git commit -m "feat(franchise-trail): add data model, seed data, and API route"
```

---

## Chunk 2: Frontend Game Mode

### Task 6: Create StintCard Component

**Files:**
- Create: `client/src/modes/FranchiseTrail/StintCard.tsx`

- [ ] **Step 1: Create StintCard component**

```typescript
import { motion } from "framer-motion";
import type { IplStint } from "../../../../shared/src/types";

const TEAM_COLORS: Record<string, string> = {
  CSK: "#FFCC00",
  MI: "#004BA0",
  RCB: "#EC1C24",
  KKR: "#3A225D",
  DC: "#00008B",
  DD: "#00008B",
  PBKS: "#ED1B24",
  KXIP: "#ED1B24",
  RR: "#EA1A85",
  SRH: "#FF822A",
  GT: "#1C1C2B",
  LSG: "#A72056",
  DEC: "#E04D18",
  KTK: "#7B2D8E",
  PWI: "#6F2DA8",
  GL: "#E35C24",
  RPS: "#6F2DA8",
};

const TEAM_NAMES: Record<string, string> = {
  CSK: "Chennai Super Kings",
  MI: "Mumbai Indians",
  RCB: "Royal Challengers Bengaluru",
  KKR: "Kolkata Knight Riders",
  DC: "Delhi Capitals",
  DD: "Delhi Daredevils",
  PBKS: "Punjab Kings",
  KXIP: "Kings XI Punjab",
  RR: "Rajasthan Royals",
  SRH: "Sunrisers Hyderabad",
  GT: "Gujarat Titans",
  LSG: "Lucknow Super Giants",
  DEC: "Deccan Chargers",
  KTK: "Kochi Tuskers Kerala",
  PWI: "Pune Warriors India",
  GL: "Gujarat Lions",
  RPS: "Rising Pune Supergiant",
};

interface StintCardProps {
  stint: IplStint;
  revealed: boolean;
  index: number;
  stintNumber: number;
  totalStints: number;
}

export function StintCard({ stint, revealed, index, stintNumber, totalStints }: StintCardProps) {
  const teamColor = TEAM_COLORS[stint.team] ?? "#666";
  const teamName = TEAM_NAMES[stint.team] ?? stint.team;
  const yearRange =
    stint.startYear === stint.endYear
      ? `${stint.startYear}`
      : `${stint.startYear} - ${stint.endYear}`;

  if (!revealed) {
    return (
      <div className="glass-card p-4 flex items-center gap-4 opacity-30">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-white/20">?</span>
        </div>
        <div>
          <p className="text-white/20 text-sm font-medium">Stint {stintNumber}</p>
          <p className="text-white/10 text-xs">Unrevealed</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-4 flex items-center gap-4"
      style={{ borderColor: `${teamColor}40` }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{ backgroundColor: `${teamColor}25`, color: teamColor }}
      >
        {stint.team}
      </div>
      <div className="min-w-0">
        <p className="text-white font-medium text-sm truncate">{teamName}</p>
        <p className="text-xs" style={{ color: teamColor }}>
          {yearRange}
        </p>
      </div>
      <div className="ml-auto text-white/20 text-xs shrink-0">
        {stintNumber}/{totalStints}
      </div>
    </motion.div>
  );
}
```

---

### Task 7: Create FranchiseTrailGame Component

**Files:**
- Create: `client/src/modes/FranchiseTrail/FranchiseTrailGame.tsx`

- [ ] **Step 1: Create the main game component**

```typescript
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { PlayerSearchInput } from "../../components/PlayerSearchInput";
import { GameIntro } from "../../components/GameIntro";
import { GAME_INTROS } from "../../data/gameIntros";
import { useLocalScore } from "../../hooks/useLocalScore";
import { apiFetch } from "../../api/client";
import { StintCard } from "./StintCard";
import type { IplCareerData } from "../../../../shared/src/types";

type GamePhase = "intro" | "loading" | "playing" | "correct" | "wrong" | "gameover";

const MAX_ROUNDS = 5;
const MAX_POINTS_PER_ROUND = 5;

function calculateScore(totalStints: number, revealedCount: number): number {
  return Math.min(MAX_POINTS_PER_ROUND, Math.max(0, totalStints + 1 - revealedCount));
}

export function FranchiseTrailGame() {
  const [career, setCareer] = useState<IplCareerData | null>(null);
  const [revealedCount, setRevealedCount] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [excludedPlayers, setExcludedPlayers] = useState<string[]>([]);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const { recordScore } = useLocalScore();

  const fetchCareer = useCallback(
    async (excluded: string[]) => {
      setPhase("loading");
      try {
        const excludeParam = excluded.length > 0 ? `?exclude=${encodeURIComponent(excluded.join(","))}` : "";
        const fetched = await apiFetch<IplCareerData>(`/franchise-trail/random${excludeParam}`);
        setCareer(fetched);
        setRevealedCount(1);
        setPhase("playing");
      } catch {
        setPhase("loading");
      }
    },
    []
  );

  function handleReveal() {
    if (!career) return;
    if (revealedCount >= career.stints.length) return;
    setRevealedCount((prev) => prev + 1);
  }

  function handleGuess(selected: { id: string; name: string; country: string }) {
    if (!career) return;

    if (selected.name.toLowerCase() === career.playerName.toLowerCase()) {
      const earned = calculateScore(career.stints.length, revealedCount);
      setRoundScore(earned);
      const newTotal = totalScore + earned;
      setTotalScore(newTotal);
      setRoundScores((prev) => [...prev, earned]);
      recordScore("franchise-trail", earned);
      setPhase("correct");
    } else if (revealedCount < career.stints.length) {
      // Wrong guess — auto-reveal next stint
      setRevealedCount((prev) => prev + 1);
    } else {
      // All stints revealed and wrong — round over
      setRoundScore(0);
      setRoundScores((prev) => [...prev, 0]);
      setPhase("wrong");
    }
  }

  function handleGiveUp() {
    setRoundScore(0);
    setRoundScores((prev) => [...prev, 0]);
    setPhase("wrong");
  }

  function handleNextRound() {
    if (!career) return;
    const newExcluded = [...excludedPlayers, career.playerName];
    setExcludedPlayers(newExcluded);

    if (roundNumber >= MAX_ROUNDS) {
      setPhase("gameover");
      return;
    }

    setRoundNumber((prev) => prev + 1);
    fetchCareer(newExcluded);
  }

  function handlePlayAgain() {
    setTotalScore(0);
    setRoundNumber(1);
    setExcludedPlayers([]);
    setRoundScores([]);
    fetchCareer([]);
  }

  if (phase === "intro") {
    return (
      <GameIntro
        {...GAME_INTROS["franchise-trail"]}
        onStart={() => fetchCareer([])}
      />
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Franchise Trail" score={totalScore} />
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (phase === "gameover") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Franchise Trail" score={totalScore} />
        <div className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-4xl mb-2 font-black"
                style={{ color: "var(--gold-accent)" }}
              >
                Game Over!
              </motion.div>
              <p className="text-white/60 text-lg">
                Final Score: <span style={{ color: "var(--gold-accent)" }}>{totalScore}</span> / {MAX_ROUNDS * MAX_POINTS_PER_ROUND}
              </p>
            </div>

            <div className="glass-card p-4 space-y-2">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Round Breakdown</p>
              {roundScores.map((score, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/60">Round {i + 1}</span>
                  <span style={{ color: score > 0 ? "var(--gold-accent)" : "rgba(239, 68, 68, 0.7)" }}>
                    {score > 0 ? `+${score}` : "0"} pts
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePlayAgain}
              className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "correct" || phase === "wrong") {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <Header title="Franchise Trail" score={totalScore} />
        <div className="max-w-md mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`text-5xl mb-3 ${phase === "correct" ? "text-green-400" : "text-red-400"}`}
                >
                  {phase === "correct" ? "Correct!" : "Wrong!"}
                </motion.div>
                <p className="text-white text-lg font-bold mb-1">{career?.playerName}</p>
                {phase === "correct" && (
                  <p className="text-white/60 text-sm">
                    +{roundScore} point{roundScore !== 1 ? "s" : ""} (guessed after {revealedCount} stint{revealedCount !== 1 ? "s" : ""})
                  </p>
                )}
              </div>

              {/* Show full career */}
              {career && (
                <div className="space-y-2">
                  {career.stints.map((stint, i) => (
                    <StintCard
                      key={`${stint.team}-${stint.startYear}`}
                      stint={stint}
                      revealed={true}
                      index={i}
                      stintNumber={i + 1}
                      totalStints={career.stints.length}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleNextRound}
                className="w-full bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold py-3 rounded-xl transition-colors"
              >
                {roundNumber >= MAX_ROUNDS ? "See Results" : "Next Round"}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Playing phase
  const stints = career?.stints ?? [];
  const totalStints = stints.length;

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Header title="Franchise Trail" score={totalScore} />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Round indicator */}
        <div className="text-center text-white/40 text-sm">
          Round {roundNumber} of {MAX_ROUNDS}
        </div>

        {/* Mystery player header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
            <span className="text-3xl text-white/15 font-black">?</span>
          </div>
          <p className="text-white/50 text-sm">Who played for these franchises?</p>
          <p className="text-white/20 text-xs mt-1">
            {revealedCount}/{totalStints} stints revealed
          </p>
        </motion.div>

        {/* Stint cards */}
        <div className="space-y-2">
          {stints.map((stint, i) => (
            <StintCard
              key={`${stint.team}-${stint.startYear}`}
              stint={stint}
              revealed={i < revealedCount}
              index={i}
              stintNumber={i + 1}
              totalStints={totalStints}
            />
          ))}
        </div>

        {/* Reveal button */}
        {revealedCount < totalStints && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReveal}
            className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3 rounded-xl transition-colors border border-white/10"
          >
            Reveal Next Stint ({totalStints - revealedCount} left)
          </motion.button>
        )}

        {/* Guess input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-white/50 text-sm text-center">
            Who is this player?
          </p>
          <PlayerSearchInput
            onSelect={handleGuess}
            placeholder="Guess the player..."
          />
        </motion.div>

        {/* Give up — only when all stints revealed */}
        {revealedCount >= totalStints && (
          <button
            onClick={handleGiveUp}
            className="w-full bg-white/5 hover:bg-white/10 text-white/50 text-sm py-2 rounded-xl transition-colors"
          >
            Give Up
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Chunk 3: App Integration

### Task 8: Add Game Intro Data

**Files:**
- Modify: `client/src/data/gameIntros.ts`

- [ ] **Step 1: Add franchise-trail intro**

Add after the last game intro entry:

```typescript
"franchise-trail": {
  title: "Franchise Trail",
  icon: "\uD83C\uDFCF",
  description:
    "Trace a player's IPL journey across franchises and guess who they are.",
  howToPlay: [
    "A mystery IPL player's franchise history is revealed one stint at a time",
    "Each stint shows the team and years they played for that franchise",
    "Guess the player at any time using the search box",
    "Wrong guesses auto-reveal the next stint",
    "You have 5 rounds per game",
  ],
  scoring: [
    "Guess after 1 stint: 5 points",
    "After 2 stints: 4 points",
    "After 3 stints: 3 points",
    "After 4 stints: 2 points",
    "After all stints: 1 point",
    "Failed to guess: 0 points",
  ],
},
```

---

### Task 9: Add Hub Mode Card

**Files:**
- Modify: `client/src/pages/Hub.tsx`

- [ ] **Step 1: Add Franchise Trail to MODES array**

Add after the Auction Arena entry (line 80):

```typescript
{
  title: "Franchise Trail",
  description: "Trace an IPL player's journey across franchises",
  icon: "\uD83C\uDFCF",
  route: "/franchise-trail",
  mode: "franchise-trail" as const,
  minPlayers: 0,
  minQuestions: 0,
},
```

---

### Task 10: Add Route to App.tsx

**Files:**
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Add import**

Add after line 15 (AuctionArenaGame import):

```typescript
import { FranchiseTrailGame } from "./modes/FranchiseTrail/FranchiseTrailGame";
```

- [ ] **Step 2: Add route**

Add after the auction-arena route (line 116):

```typescript
<Route
  path="/franchise-trail"
  element={
    <RequireAuth>
      <FranchiseTrailGame />
    </RequireAuth>
  }
/>
```

- [ ] **Step 3: Verify frontend compiles**

Run: `cd /Users/arunraja/Documents/quiz && npm run build --workspace=client 2>&1 | tail -5`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Manual verification**

Open `http://localhost:5173` in browser. Verify:
1. Franchise Trail appears as 9th mode card on Hub
2. Clicking it shows the intro screen
3. Starting a game loads a career and shows the first stint
4. Revealing stints works progressively
5. Guessing correctly shows the full career + score
6. Wrong guess auto-reveals next stint
7. Give Up appears when all stints shown
8. Game over screen shows after 5 rounds

- [ ] **Step 5: Commit frontend**

```bash
git add client/src/modes/FranchiseTrail/ client/src/data/gameIntros.ts client/src/pages/Hub.tsx client/src/App.tsx
git commit -m "feat(franchise-trail): add game mode UI with progressive stint reveal"
```
