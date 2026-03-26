# CrickMind — Cricket Quiz Game Design Spec

## Overview

CrickMind is a multi-mode cricket quiz game built as a React + TypeScript SPA with a Node.js/Express backend and PostgreSQL database. It features 4 game modes at launch (2 more planned for Phase 2), unlimited play, and covers all cricket formats (International + IPL + domestic leagues).

**Target audience:** Easy to pick up for casual fans, hard to master for cricket experts.

## Game Modes

### Phase 1 (Launch)

#### 1. Who Am I? (Stumple-style)

A deduction game where players guess a mystery cricketer by entering names and receiving attribute-based feedback.

- **Input:** Search box with autocomplete from the player database
- **Feedback per guess:** A row of attribute columns with color-coded results:
  - Green = exact match
  - Yellow = close (same region for nation, within 3 years for birth year, same bowling/batting type for role)
  - Gray = no match
  - Up/down arrows for numeric attributes (born year, total matches)
- **Attributes shown:** Nation, Role, Format (Test/ODI/T20), Batting Hand, Born Year, Total Matches, IPL Team
- **Guesses:** Maximum 8 per round
- **Scoring:** 8 points for guess 1, decrementing to 1 point for guess 8. 0 for failure.
- **End state:** Win = confetti animation + player stats card. Loss = answer reveal + stats card.

**Attribute Match Logic:**

| Attribute | Green (exact) | Yellow (close) | Gray (no match) |
|-----------|--------------|----------------|-----------------|
| Nation | Same country | Same region* | Different region |
| Role | Same role | Adjacent role** | Unrelated role |
| Format | Same formats | Shares at least 1 format | No shared formats |
| Batting Hand | Same hand | — (binary, no yellow) | Different hand |
| Born Year | Same year | Within 3 years | More than 3 years apart |
| Total Matches | Same count | Within 50 matches | More than 50 apart |
| IPL Team | Same team | Same conference/group*** | Different or None |

\* **Region mapping:** South Asia (IND, PAK, SL, BAN, AFG, NEP), Oceania (AUS, NZ), British Isles (ENG, IRE, SCO), Southern Africa (SA, ZIM), Caribbean (WI and all WI nations)

\*\* **Role adjacency:** Batsman↔All-rounder (yellow), Bowler↔All-rounder (yellow), Wicket-keeper↔Batsman (yellow). All other combos are gray.

\*\*\* **IPL proximity:** Both have current IPL teams but different ones = yellow. One has "None" and other has a team = gray.

**Accessibility:** Each cell also displays a text icon alongside color: checkmark for green, tilde (~) for yellow, cross (X) for gray. This ensures color-blind users can play.

#### 2. Stat Attack

A progressive reveal game where stats are shown one at a time and the player guesses who it is.

- **Display:** Central "mystery player" card with "?" silhouette
- **Mechanic:** "Reveal Next Stat" button flips in a stat card (batting avg, strike rate, total runs, total matches)
- **Guesses:** Player can guess after each reveal. Maximum 4 reveals before answer is shown.
- **Scoring:** 4 points for guessing after 1 reveal, 3 after 2, 2 after 3, 1 after 4. 0 if all revealed and still wrong.
- **Timer:** No timer in Phase 1. Deferred to Phase 2 as a toggleable setting.
- **Stat pool per role:** Batsmen get batting avg, strike rate, total runs, total matches. Bowlers get bowling avg, economy rate, total wickets, total matches. All-rounders get batting avg, bowling avg, total runs, total wickets. Stats are revealed in a fixed order (as listed).
- **Guess input:** Same player search autocomplete as Who Am I mode.

#### 3. Quick Fire

Rapid multiple-choice cricket trivia.

- **Format:** 10 questions per round, 4 options each, 15-second timer per question
- **Question types:** Records, World Cups, IPL milestones, debuts, partnerships, historic moments
- **Scoring:** 10 points per correct answer + speed bonus. Formula: `bonus = Math.max(0, Math.round(5 * (15 - elapsedSeconds) / 12))`. Timeout (>=15s) = 0 bonus and marked wrong.
- **Display:** Full-screen question card with countdown timer bar. Green flash for correct, red shake for wrong.
- **End screen:** Scorecard styled like a cricket match summary (total score, accuracy %, fastest answer)
- **Categories:** Questions tagged by category and difficulty. Random mix for general play.

#### 4. Higher or Lower

Compare two cricketers on a given stat and pick who has more.

- **Display:** Two player cards side by side with photos, names, and teams
- **Mechanic:** A stat category displayed between them (e.g., "Total ODI Runs"). Player clicks left or right.
- **Correct:** Losing card slides out, new challenger slides in. Streak continues.
- **Wrong:** Streak over. Final score = streak length.
- **Data fetching:** Frontend calls `GET /api/players/pair` for the initial pair. On correct answer, calls `GET /api/players/next-challenger?current_id=X&streak=N` to get a single new challenger while keeping the winner on screen.
- **Progression:** Uses `popularity_tier` on players (1=legend, 2=well-known, 3=moderate, 4=obscure). Streak 0-3: tier 1-2 players with >30% stat gap. Streak 4-7: tier 1-3 with >15% gap. Streak 8+: any tier with <15% gap.
- **Scoring:** Score = longest streak. Fire animation at streak 5+.

### Phase 2 (Post-Launch)

#### 5. Career Timeline

Timeline of career events (debut, milestones, team transfers) without the player name. Player deduces who it is.

#### 6. Photo Round

Pixelated/blurred player image that progressively sharpens with each wrong guess. Fewer guesses = more points.

## Architecture

### Frontend

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Routing:** React Router v6
- **Animations:** Framer Motion (confetti, card flips, slides, shakes)
- **Data fetching:** TanStack Query (caching, loading states, error handling)
- **Styling:** Tailwind CSS
- **Responsive:** Mobile-first design

### Backend

- **Runtime:** Node.js + Express + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL

### API Endpoints

```
GET  /api/players/search?q=       → Autocomplete player search (used by Who Am I + Stat Attack)
GET  /api/players/random          → Random verified player for Who Am I
GET  /api/players/pair            → Two players + stat category for Higher or Lower (initial)
GET  /api/players/next-challenger → Next player for Higher or Lower (query: current_id, streak)
GET  /api/players/:id/stats       → Progressive stat reveal for Stat Attack
GET  /api/questions                → Quiz questions (query: category, count, difficulty)
POST /api/scores                   → Save game result (optional, for future leaderboards)
GET  /api/health                   → Health check
```

**Rate limiting:** 100 requests/minute per IP across all endpoints. Express rate-limit middleware.

**CORS:** Configured to allow the frontend origin (localhost in dev, production domain in prod).

**Error responses:** All endpoints return `{ error: string, code: string }` on failure. 404 if insufficient verified players for a mode. 400 for invalid params.

### Data Pipeline

1. **Ingestion script** (`scripts/ingest.ts`): Fetches player data from CricAPI/CricketData.org, inserts into `players_raw` table
2. **Curation script** (`scripts/curate.ts`): CLI tool to review raw players, verify data accuracy, and mark as `verified`
3. **Seed script** (`scripts/seed.ts`): Seeds initial ~200 verified players + ~100 quiz questions for launch
4. **Game logic** only uses players with `verified = true`

### Database Schema

#### players

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar | Full player name |
| country | varchar | Country code (IND, AUS, ENG, etc.) |
| role | varchar | Batsman, Bowler, All-rounder, Wicket-keeper |
| formats | varchar[] | Array of formats played (Test, ODI, T20I, IPL) |
| batting_hand | varchar | Right or Left |
| bowling_style | varchar | Right-arm fast, Right-arm medium, Left-arm fast, Left-arm medium, Off-spin, Leg-spin, Left-arm orthodox, Left-arm wrist spin, None |
| popularity_tier | integer | 1=legend, 2=well-known, 3=moderate, 4=obscure (for Higher or Lower difficulty) |
| born_year | integer | Birth year |
| debut_year | integer | International debut year |
| retired | boolean | Whether the player has retired |
| total_matches | integer | Total international matches |
| total_runs | integer | Total international runs |
| batting_avg | decimal | Career batting average |
| strike_rate | decimal | Career strike rate |
| total_wickets | integer | Total international wickets |
| bowling_avg | decimal | Career bowling average |
| economy_rate | decimal | Career economy rate |
| ipl_team | varchar | Current IPL team or "None" |
| photo_url | varchar | Player photo URL |
| verified | boolean | Whether data has been curated/verified |
| source | varchar | Data source (cricapi, manual, etc.) |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

#### quiz_questions

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question | text | Question text |
| options | jsonb | Array of 4 option strings |
| correct_answer | integer | Index of correct option (0-3) |
| category | varchar | Records, WorldCup, IPL, Debuts, Milestones |
| difficulty | varchar | easy, medium, hard |
| format_tag | varchar | Test, ODI, T20I, IPL, General |

#### game_sessions (optional, for future leaderboards)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| anonymous_id | varchar | Device/browser fingerprint for future user migration |
| mode | varchar | Game mode identifier |
| score | integer | Final score |
| details | jsonb | Mode-specific details (guesses, streak, etc.) |
| completed_at | timestamp | When the game ended |

## UI Design

### Home Screen (Hub)

- Game title "CrickMind" with cricket-themed header (green gradient, cricket ball icon)
- 4 game mode cards in a 2x2 grid (responsive: single column on mobile)
- Each card: icon, mode name, one-line description, personal high score badge
- Total cumulative score displayed prominently at top
- Dark theme with cricket green (#1B5E20) and gold (#FFD600) accents
- Subtle animated background (floating cricket balls or stumps)

### Shared UI Components

- **Header:** Mode name, back-to-hub button, current score/streak
- **Player search autocomplete:** Debounced search, shows player name + country flag
- **Player stats card:** Used across modes for reveal — photo, name, country flag, key stats
- **Score popup:** Animated "+X pts" that floats up on scoring
- **Timer bar:** Horizontal bar that depletes with time, changes color (green → yellow → red)
- **Result screen:** Score summary, play again button, back to hub button

### Animations & Interactions

- Page transitions: slide left/right between hub and modes
- Guess rows: slide in from bottom with stagger
- Card flips: 3D flip for stat reveals
- Confetti: on win in Who Am I and Quick Fire perfect score
- Shake: on wrong answer
- Streak fire: pulsing fire emoji/animation at streak 5+
- Score counter: animated number increment

### Color Coding (Who Am I)

- Green: `#4CAF50` — exact match
- Yellow: `#FFC107` — close match
- Gray: `#9E9E9E` — no match
- Background: Dark `#1A1A2E` with card surfaces at `#16213E`

## Project Structure

```
quiz/
├── client/                    # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/        # Shared UI (Header, PlayerCard, Timer, ScorePopup)
│   │   ├── modes/             # Game mode pages
│   │   │   ├── WhoAmI/
│   │   │   ├── StatAttack/
│   │   │   ├── QuickFire/
│   │   │   └── HigherOrLower/
│   │   ├── pages/             # Hub, Results
│   │   ├── hooks/             # useGameState, useTimer, useScore
│   │   ├── api/               # API client (TanStack Query queries)
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helpers (scoring, color logic)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic (player selection, question picking)
│   │   ├── middleware/        # Error handling, validation
│   │   └── index.ts           # Server entry
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/
│   └── tsconfig.json
├── scripts/                   # Data pipeline
│   ├── ingest.ts              # Fetch from cricket API
│   ├── curate.ts              # CLI curation tool
│   └── seed.ts                # Initial data seed
├── shared/                    # Shared types
│   └── types.ts
├── package.json               # Monorepo root
└── README.md
```

## Scoring Summary

| Mode | Scoring | Max per round |
|------|---------|---------------|
| Who Am I? | 8 pts (guess 1) → 1 pt (guess 8), 0 on fail | 8 |
| Stat Attack | 4 pts (1 reveal) → 1 pt (4 reveals), 0 on fail | 4 |
| Quick Fire | 10 pts + up to 5 speed bonus per question | 150 |
| Higher or Lower | Score = streak length | Unlimited |

## Phase 1 Scope (MVP)

- 4 game modes fully functional
- ~200 verified players in database
- ~100 curated quiz questions across categories
- Data ingestion + curation pipeline
- Mobile-responsive dark-themed UI
- Local storage for scores (no auth)
- Deployed as two services (frontend on Vercel/Netlify, backend on Railway/Render)

## Error States & Edge Cases

- **API unreachable:** Show "Connection error — check your internet" with retry button. Game modes disabled until API responds.
- **Insufficient players:** If fewer than 2 verified players exist, Higher or Lower is disabled with "Coming soon" badge. Who Am I and Stat Attack require at least 1 player.
- **No quiz questions for category:** Fall back to "General" category. If no questions exist at all, Quick Fire shows "No questions available" with back-to-hub button.
- **Player photo missing:** Show silhouette placeholder with player initials overlay. Photos sourced from public cricket board media (BCCI, ICC, etc.) or Unsplash cricket photos as fallback. Photo URLs stored in DB, served via CDN.
- **Search returns no results:** Autocomplete shows "No players found" message.
- **Duplicate random player:** Backend tracks recently served player IDs (last 20) per session to avoid repeats.

## Out of Scope (Phase 1)

- User authentication / accounts
- Global leaderboards
- Social sharing of results
- Career Timeline mode
- Photo Round mode
- Multiplayer / challenge friends
- Push notifications
