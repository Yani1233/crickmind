import type { Player, MatchResult, AttributeGuessResult } from "../../../shared/src/types";
import { REGION_MAP, ROLE_ADJACENCY } from "../../../shared/src/types";
import type { Role } from "../../../shared/src/types";

function compareNation(guess: string, target: string): MatchResult {
  if (guess === target) return "green";
  const guessRegion = REGION_MAP[guess];
  const targetRegion = REGION_MAP[target];
  if (guessRegion && targetRegion && guessRegion === targetRegion) return "yellow";
  return "gray";
}

function compareRole(guess: string, target: string): MatchResult {
  if (guess === target) return "green";
  const adjacent = ROLE_ADJACENCY[guess as Role];
  if (adjacent && adjacent.includes(target as Role)) return "yellow";
  return "gray";
}

function compareFormats(guess: string[], target: string[]): MatchResult {
  const guessSet = new Set(guess);
  const targetSet = new Set(target);
  if (
    guessSet.size === targetSet.size &&
    [...guessSet].every((f) => targetSet.has(f))
  ) {
    return "green";
  }
  if ([...guessSet].some((f) => targetSet.has(f))) return "yellow";
  return "gray";
}

function compareBattingHand(guess: string, target: string): MatchResult {
  return guess === target ? "green" : "gray";
}

function compareNumeric(
  guess: number,
  target: number,
  threshold: number
): { result: MatchResult; direction?: "up" | "down" } {
  if (guess === target) return { result: "green" };
  const diff = Math.abs(guess - target);
  const direction = target > guess ? "up" : "down";
  if (diff <= threshold) return { result: "yellow", direction };
  return { result: "gray", direction };
}

function compareIplTeam(guess: string, target: string): MatchResult {
  if (guess === target) return "green";
  if (guess !== "None" && target !== "None") return "yellow";
  return "gray";
}

export function comparePlayer(
  guess: Player,
  target: Player
): AttributeGuessResult[] {
  const results: AttributeGuessResult[] = [];

  // Nation
  const nationResult = compareNation(guess.country, target.country);
  results.push({
    attribute: "Nation",
    value: guess.country,
    result: nationResult,
  });

  // Role
  const roleResult = compareRole(guess.role, target.role);
  results.push({
    attribute: "Role",
    value: guess.role,
    result: roleResult,
  });

  // Format
  const formatResult = compareFormats(guess.formats, target.formats);
  results.push({
    attribute: "Format",
    value: guess.formats.join(", "),
    result: formatResult,
  });

  // Batting Hand
  const handResult = compareBattingHand(guess.battingHand, target.battingHand);
  results.push({
    attribute: "Batting Hand",
    value: guess.battingHand,
    result: handResult,
  });

  // Born Year
  const bornResult = compareNumeric(guess.bornYear, target.bornYear, 3);
  results.push({
    attribute: "Born Year",
    value: String(guess.bornYear),
    result: bornResult.result,
    direction: bornResult.direction,
  });

  // Total Matches
  const matchResult = compareNumeric(
    guess.totalMatches,
    target.totalMatches,
    50
  );
  results.push({
    attribute: "Total Matches",
    value: String(guess.totalMatches),
    result: matchResult.result,
    direction: matchResult.direction,
  });

  // IPL Team
  const iplResult = compareIplTeam(guess.iplTeam, target.iplTeam);
  results.push({
    attribute: "IPL Team",
    value: guess.iplTeam,
    result: iplResult,
  });

  return results;
}
