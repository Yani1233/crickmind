/**
 * Calculate speed bonus for Quick Fire mode.
 * 5 pts if answered within 3s, scales linearly to 0 at 15s.
 */
export function calculateSpeedBonus(elapsedSeconds: number): number {
  return Math.max(0, Math.round((5 * (15 - elapsedSeconds)) / 12));
}

/**
 * Calculate Who Am I score based on guess number (1-indexed).
 * Guess 1 = 8 pts, Guess 8 = 1 pt.
 */
export function calculateWhoAmIScore(guessNumber: number): number {
  if (guessNumber < 1 || guessNumber > 8) return 0;
  return 9 - guessNumber;
}

/**
 * Calculate Stat Attack score based on reveals used (1-indexed).
 * 1 reveal = 4 pts, 4 reveals = 1 pt.
 */
export function calculateStatAttackScore(revealsUsed: number): number {
  if (revealsUsed < 1 || revealsUsed > 4) return 0;
  return 5 - revealsUsed;
}
