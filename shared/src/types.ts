// Player types
export type Role = "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
export type BattingHand = "Right" | "Left";
export type BowlingStyle =
  | "Right-arm fast"
  | "Right-arm medium"
  | "Left-arm fast"
  | "Left-arm medium"
  | "Off-spin"
  | "Leg-spin"
  | "Left-arm orthodox"
  | "Left-arm wrist spin"
  | "None";
export type Format = "Test" | "ODI" | "T20I" | "IPL";
export type PopularityTier = 1 | 2 | 3 | 4;
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionCategory =
  | "Records"
  | "WorldCup"
  | "IPL"
  | "Debuts"
  | "Milestones";
export type FormatTag = "Test" | "ODI" | "T20I" | "IPL" | "General";
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
  direction?: "up" | "down";
}

export interface WhoAmIGuess {
  player: Player;
  results: AttributeGuessResult[];
}

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

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface UserWithStats extends UserProfile {
  totalScore: number;
  totalGames: number;
  modeStats: Partial<Record<GameMode, { highScore: number; gamesPlayed: number; totalScore: number }>>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  totalScore: number;
  highScore: number;
  gamesPlayed: number;
}

export interface RoomInfo {
  code: string;
  members: Array<{ userId: string; displayName: string }>;
}

// Region mapping for Who Am I
export const REGION_MAP: Record<string, string> = {
  IND: "South Asia",
  PAK: "South Asia",
  SL: "South Asia",
  BAN: "South Asia",
  AFG: "South Asia",
  NEP: "South Asia",
  AUS: "Oceania",
  NZ: "Oceania",
  ENG: "British Isles",
  IRE: "British Isles",
  SCO: "British Isles",
  SA: "Southern Africa",
  ZIM: "Southern Africa",
  WI: "Caribbean",
};

// Role adjacency for Who Am I
export const ROLE_ADJACENCY: Record<Role, Role[]> = {
  Batsman: ["All-rounder", "Wicket-keeper"],
  Bowler: ["All-rounder"],
  "All-rounder": ["Batsman", "Bowler"],
  "Wicket-keeper": ["Batsman"],
};
