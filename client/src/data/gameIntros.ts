export const GAME_INTROS = {
  "who-am-i": {
    title: "Who Am I?",
    icon: "\uD83D\uDD0D",
    description:
      "Guess the mystery cricketer by comparing attributes. Each guess reveals clues about the target player.",
    howToPlay: [
      "A mystery cricketer is chosen at random",
      "Type a player's name to make a guess",
      "After each guess, attributes are color-coded: Green = match, Yellow = close, Gray = no match",
      "Use the clues to narrow down and identify the mystery player",
      "You have 8 guesses to find the answer",
    ],
    scoring: [
      "Guess on 1st try: 8 points",
      "Guess on 2nd try: 7 points",
      "Each additional guess: -1 point",
      "Failed to guess: 0 points",
    ],
  },
  "stat-attack": {
    title: "Stat Attack",
    icon: "\uD83D\uDCCA",
    description:
      "A mystery player's stats are revealed one by one. The fewer stats you need, the more points you earn.",
    howToPlay: [
      "A mystery cricketer is selected",
      "Click 'Reveal Next Stat' to see one stat at a time",
      "Stats include batting average, strike rate, wickets, etc.",
      "Guess the player at any time using the search box",
      "Fewer reveals = higher score",
    ],
    scoring: [
      "Guess after 1 stat: 4 points",
      "Guess after 2 stats: 3 points",
      "Guess after 3 stats: 2 points",
      "Guess after 4 stats: 1 point",
      "Wrong guess: 0 points",
    ],
  },
  "quick-fire": {
    title: "Quick Fire",
    icon: "\u26A1",
    description:
      "Answer 10 rapid-fire cricket trivia questions against the clock. Speed and accuracy both matter!",
    howToPlay: [
      "10 multiple-choice questions appear one by one",
      "Each question has a 15-second timer",
      "Select your answer from 4 options",
      "Faster correct answers earn bonus points",
      "Wrong answers or timeouts score 0",
    ],
    scoring: [
      "Correct answer: 10 base points",
      "Speed bonus: up to 5 extra points for fast answers",
      "Wrong answer: 0 points",
      "Maximum possible: 150 points",
    ],
  },
  "higher-or-lower": {
    title: "Higher or Lower",
    icon: "\u2696\uFE0F",
    description:
      "Compare two cricketers \u2014 who has the higher stat? Build the longest streak you can!",
    howToPlay: [
      "Two players are shown with a stat category (e.g., ODI Runs)",
      "Pick which player has the HIGHER value for that stat",
      "Correct: the winner stays, a new challenger appears",
      "Wrong: your streak ends!",
      "Try to build the longest streak possible",
    ],
    scoring: [
      "Score = your longest streak",
      "Difficulty increases as streak grows",
      "Streak of 5+: fire mode activated!",
      "No maximum \u2014 keep going!",
    ],
  },
  connections: {
    title: "Connections",
    icon: "\uD83D\uDD17",
    description:
      "Find the hidden connections! Group 16 cricket items into 4 categories of 4.",
    howToPlay: [
      "16 items are displayed in a 4\u00D74 grid",
      "Select exactly 4 items that share a hidden connection",
      "Click 'Submit' to check your group",
      "Correct: the group is revealed with its category name",
      "Wrong: you lose one of your 4 lives",
      "Find all 4 groups to win!",
    ],
    scoring: [
      "Each correct group: 4 points",
      "Bonus: +1 point per remaining life",
      "Maximum: 20 points (all groups + 4 lives)",
      "0 lives = game over, remaining groups revealed",
    ],
  },
  timeline: {
    title: "Timeline",
    icon: "\uD83D\uDCC5",
    description:
      "Put cricket history in order! Drag events into the correct chronological sequence.",
    howToPlay: [
      "6 cricket events are shown in random order",
      "The years are hidden \u2014 use your knowledge!",
      "Drag and drop to rearrange into chronological order",
      "Click 'Lock In' when you're confident",
      "The correct years are then revealed",
    ],
    scoring: [
      "Each correctly placed event: 2 points",
      "Maximum: 12 points (all 6 correct)",
      "Partial credit for each correct position",
      "Events span from 1970s to present day",
    ],
  },
  "mystery-xi": {
    title: "Mystery XI",
    icon: "\uD83C\uDFCF",
    description:
      "Can you name all 11 players in a famous cricket squad? Test your cricket history knowledge!",
    howToPlay: [
      "A famous squad is described (e.g., '2011 World Cup Final XI')",
      "Type player names to guess who's in the squad",
      "Correct guesses fill the formation slots",
      "You have 120 seconds to find all 11 players",
      "Click 'Give Up' to reveal remaining players",
    ],
    scoring: [
      "Each correct player: 2 points",
      "Maximum: 22 points (all 11 players)",
      "Timer adds pressure but doesn't affect points",
      "Partial credit for whatever you find",
    ],
  },
  "auction-arena": {
    title: "Auction Arena",
    icon: "\uD83D\uDCB0",
    description:
      "Channel your inner IPL team owner! Guess how much each player sold for at the auction.",
    howToPlay: [
      "A player, auction year, and buying team are shown",
      "Use the slider to set your price guess (\u20B90.2Cr - \u20B930Cr)",
      "Click 'Lock In Bid' to submit your guess",
      "The actual auction price is revealed",
      "10 players per round",
    ],
    scoring: [
      "Within \u20B90.5 Cr (Spot On): 10 points",
      "Within 25% of actual: 7 points",
      "Within 50% of actual: 4 points",
      "Within 100% of actual: 2 points",
      "Way off: 0 points",
    ],
  },
} as const;

export type GameIntroKey = keyof typeof GAME_INTROS;
