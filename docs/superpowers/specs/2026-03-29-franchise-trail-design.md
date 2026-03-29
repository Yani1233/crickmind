# Franchise Trail — Design Spec

## Overview

A progressive-reveal guessing game where players see an IPL cricketer's franchise history one stint at a time (earliest first) and guess who it is. Fewer reveals = higher score.

## Gameplay Flow

1. **Intro screen** — explains rules, scoring, and how stints are revealed
2. **Round start** — API returns a random player with 2+ distinct IPL teams
3. **Progressive reveal** — stints shown one at a time (chronological order), each as a card displaying team name/logo + year range
4. **Guess at any point** — player types a name in the autocomplete search box (same `PlayerSearchInput` used by Who Am I / Stat Attack)
5. **Correct guess** — reveal full career timeline, show round score, advance to next round
6. **Wrong guess** — next stint auto-reveals (or game over if all stints already shown)
7. **5 rounds per game** — total score summed across all rounds

### Phase Machine

```
intro → loading → playing → (correct | wrong) → playing (next round) → gameover
```

## Scoring

| Stints Revealed | Points |
|-----------------|--------|
| 1               | 5      |
| 2               | 4      |
| 3               | 3      |
| 4               | 2      |
| All (last chance) | 1    |
| Failed          | 0      |

- Score per round = `Math.min(5, Math.max(0, totalStints + 1 - revealedCount))` — capped at 5 regardless of stint count
- Max score per game: **25 points** (5 rounds x 5 pts)
- Game mode key: `"franchise-trail"`

## Data Model

### New Prisma Model: `IplCareer`

```prisma
model IplCareer {
  id         String   @id @default(uuid())
  playerName String   @unique @map("player_name")
  stints     Json     // Array of {team: string, startYear: number, endYear: number}
  totalTeams Int      @map("total_teams") // Count of distinct teams
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("ipl_careers")
}
```

### Stint Shape

```typescript
interface IplStint {
  team: string;       // e.g. "CSK", "MI", "RCB"
  startYear: number;  // e.g. 2008
  endYear: number;    // e.g. 2015
}
```

### Example Data

**MS Dhoni:**
```json
{
  "playerName": "MS Dhoni",
  "stints": [
    {"team": "CSK", "startYear": 2008, "endYear": 2015},
    {"team": "RPS", "startYear": 2016, "endYear": 2017},
    {"team": "CSK", "startYear": 2018, "endYear": 2024}
  ],
  "totalTeams": 2
}
```

**KL Rahul:**
```json
{
  "playerName": "KL Rahul",
  "stints": [
    {"team": "RCB", "startYear": 2013, "endYear": 2016},
    {"team": "SRH", "startYear": 2014, "endYear": 2014},
    {"team": "PBKS", "startYear": 2018, "endYear": 2021},
    {"team": "LSG", "startYear": 2022, "endYear": 2024}
  ],
  "totalTeams": 4
}
```

### IPL Team Codes

Active: CSK, MI, RCB, KKR, DC, PBKS, RR, SRH, GT, LSG

Defunct/Renamed: DEC (Deccan Chargers), KTK (Kochi Tuskers), PWI (Pune Warriors), GL (Gujarat Lions), RPS (Rising Pune Supergiant)

Historical renames: DD → DC (Delhi Daredevils → Delhi Capitals), KXIP → PBKS (Kings XI Punjab → Punjab Kings)

## API Design

### `GET /api/franchise-trail/random`

Returns a random IPL career for gameplay.

**Query params:**
- `exclude` (optional) — comma-separated player names to exclude (prevents repeats within a game)

**Response** (wrapped in standard `{ data: ... }` envelope):
```json
{
  "data": {
    "playerName": "MS Dhoni",
    "stints": [
      {"team": "CSK", "startYear": 2008, "endYear": 2015},
      {"team": "RPS", "startYear": 2016, "endYear": 2017},
      {"team": "CSK", "startYear": 2018, "endYear": 2024}
    ],
    "totalTeams": 2
  }
}
```

**Selection criteria:**
- Player must have 2+ stints (played for multiple teams OR returned to same team after gap)
- Weighted toward players with more stints (more interesting puzzles)
- Random selection with exclusion list

### Player Search (existing)

Reuse existing `GET /api/players/search?q=...` endpoint for autocomplete guesses.

## Frontend Architecture

### New Files

```
client/src/modes/FranchiseTrail/
├── FranchiseTrailGame.tsx   # Main game component
└── StintCard.tsx            # Individual stint display card
```

### FranchiseTrailGame.tsx

Follows the same pattern as `StatAttackGame.tsx`:
- Phase state machine: `intro | loading | playing | correct | wrong | gameover`
- Uses `PlayerSearchInput` for guesses
- Uses `GameIntro` for intro screen
- Uses `useLocalScore` for score persistence
- Framer Motion animations for stint reveals

**State:**
```typescript
const [career, setCareer] = useState<IplCareerData | null>(null);
const [revealedCount, setRevealedCount] = useState(1); // Start with 1 stint shown
const [phase, setPhase] = useState<GamePhase>("intro");
const [roundScore, setRoundScore] = useState(0);
const [totalScore, setTotalScore] = useState(0);
const [roundNumber, setRoundNumber] = useState(1);
const [excludedPlayers, setExcludedPlayers] = useState<string[]>([]);
```

### StintCard.tsx

Displays one IPL stint:
- Team name with team color accent
- Year range (e.g. "2008 - 2015")
- Animated entrance (slide in from left, staggered)
- Unrevealed stints shown as "?" placeholder cards

### Team Colors

Map team codes to brand colors for visual identity:
```typescript
const TEAM_COLORS: Record<string, string> = {
  CSK: "#FFCC00",
  MI: "#004BA0",
  RCB: "#EC1C24",
  KKR: "#3A225D",
  DC: "#00008B",
  PBKS: "#ED1B24",
  RR: "#EA1A85",
  SRH: "#FF822A",
  GT: "#1C1C2B",
  LSG: "#A72056",
  // Defunct teams
  DEC: "#E04D18",
  KTK: "#7B2D8E",
  PWI: "#6F2DA8",
  GL: "#E35C24",
  RPS: "#6F2DA8",
};
```

## Data Scraping Strategy

### Source: ESPNcricinfo

Use the `hs-consumer-api.espncricinfo.com` reverse-engineered API or scrape IPL squad pages per season to build franchise history.

### Approach

1. For each IPL season (2008-2025), get the squad list per team
2. Build a player → team → year mapping
3. Consolidate into stints (consecutive years with same team = one stint)
4. Filter to players with 2+ stints
5. Store in `ipl_careers` table

### Script: `scripts/seed-ipl-careers.ts`

- Fetches IPL squad data per season
- Builds career timelines
- Upserts into database
- Target: 200+ players with multi-team histories

### Fallback

If scraping is unreliable, maintain a curated JSON file (`scripts/data/ipl-careers.json`) with manually verified data for top 150+ players and seed from that.

## Shared Types

Add to `shared/src/types.ts`:

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

Update `GameMode` union:
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

## Game Intro

Add to `gameIntros.ts`:

```typescript
"franchise-trail": {
  title: "Franchise Trail",
  icon: "🏏",
  description: "Trace a player's IPL journey across franchises and guess who they are.",
  howToPlay: [
    "A mystery IPL player's franchise history is revealed one stint at a time",
    "Each stint shows the team and years they played for that franchise",
    "Guess the player at any time using the search box",
    "The fewer stints you need, the more points you earn",
    "You have 5 rounds per game"
  ],
  scoring: [
    "Guess after 1 stint: 5 points",
    "After 2 stints: 4 points",
    "After 3 stints: 3 points",
    "After 4 stints: 2 points",
    "After all stints: 1 point",
    "Failed to guess: 0 points"
  ]
}
```

## Hub Integration

Add to `MODES` array in `Hub.tsx`:

```typescript
{
  title: "Franchise Trail",
  description: "Trace an IPL player's journey across franchises",
  icon: "🏏",
  route: "/franchise-trail",
  mode: "franchise-trail" as const,
  minPlayers: 0,
  minQuestions: 0,
}
```

## Router

Add route in `App.tsx`:
```typescript
<Route path="/franchise-trail" element={<FranchiseTrailGame />} />
```

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | Edit | Add `IplCareer` model |
| `server/src/routes/franchiseTrail.ts` | Create | API route for random career |
| `server/src/index.ts` | Edit | Register new route |
| `client/src/modes/FranchiseTrail/FranchiseTrailGame.tsx` | Create | Main game component |
| `client/src/modes/FranchiseTrail/StintCard.tsx` | Create | Stint card component |
| `client/src/App.tsx` | Edit | Add route |
| `client/src/pages/Hub.tsx` | Edit | Add mode card |
| `client/src/data/gameIntros.ts` | Edit | Add intro data |
| `shared/src/types.ts` | Edit | Add types, update GameMode |
| `scripts/seed-ipl-careers.ts` | Create | Data scraper/seeder |
| `scripts/data/ipl-careers.json` | Create | Fallback curated data |

## Edge Cases

- **Player with only 1 stint:** Excluded from game (not interesting enough)
- **Same team, gap in between:** Treated as 2 separate stints (e.g. Dhoni's CSK → RPS → CSK)
- **Defunct teams:** Use historical name at time of playing (e.g. "DD" not "DC" for pre-2019)
- **Name matching:** Case-insensitive comparison on guess vs `IplCareer.playerName`. Seed script normalizes names to match `Player.name` exactly.
- **No more players available:** Show game over after exhausting exclusion list (unlikely with 200+ players)
- **Unrevealed stint placeholders:** Static "?" cards shown grayed out — not clickable. Only "Reveal Next" button advances.
- **Exclusion across rounds:** `excludedPlayers` state array accumulates player names; passed as `?exclude=name1,name2` query param to API each round.
- **Gameover phase:** After round 5 completes (correct or wrong), transition to `gameover` phase showing total score + per-round breakdown. "Play Again" resets all state.
