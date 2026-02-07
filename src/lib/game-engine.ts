import { BetPlacement, GameState, Profile, RoundResult, SwipeAction } from '@/types/game';
import { calculateBetResult, getOutcome, getPayoff } from './payoff';
import { generateProfiles, getAIDecision } from './profiles';

const TOTAL_ROUNDS = 15;
const STARTING_BALANCE = 500;
const STREAK_THRESHOLD = 3;

export function createInitialState(): GameState {
  const profiles = generateProfiles(TOTAL_ROUNDS);
  return {
    balance: STARTING_BALANCE,
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    history: [],
    currentProfile: profiles[0],
    currentBet: null,
    streak: 0,
    multiplier: 1.0,
    _profiles: profiles,
  } as GameState & { _profiles: Profile[] };
}

export function placeBet(state: GameState, bet: BetPlacement): GameState {
  if (bet.amount > state.balance) {
    return { ...state, currentBet: { ...bet, amount: state.balance } };
  }
  return { ...state, currentBet: bet };
}

export function processSwipe(
  state: GameState & { _profiles?: Profile[] },
  myAction: SwipeAction
): { newState: GameState; result: RoundResult } {
  const profile = state.currentProfile!;
  const theirAction = getAIDecision(profile.personality, myAction);
  const outcome = getOutcome(myAction, theirAction);

  // Calculate base payoff with multiplier
  let balanceChange = Math.round(getPayoff(myAction, theirAction) * state.multiplier);

  // Calculate bet result
  let betResult = 0;
  if (state.currentBet) {
    betResult = calculateBetResult(
      state.currentBet.prediction,
      theirAction,
      state.currentBet.amount
    );
  }

  const totalChange = balanceChange + betResult;

  // Update streak
  let newStreak = state.streak;
  let newMultiplier = state.multiplier;

  if (outcome === 'mutual_match' || outcome === 'i_rejected_they_liked') {
    // Positive outcomes continue streak
    newStreak++;
    if (newStreak >= STREAK_THRESHOLD) {
      newMultiplier = 1.0 + (newStreak - STREAK_THRESHOLD + 1) * 0.25;
    }
  } else {
    newStreak = 0;
    newMultiplier = 1.0;
  }

  const result: RoundResult = {
    profile,
    myAction,
    theirAction,
    bet: state.currentBet,
    balanceChange,
    betResult,
    isMatch: outcome === 'mutual_match',
    isMutualReject: outcome === 'mutual_reject',
  };

  const profiles = (state as { _profiles?: Profile[] })._profiles || [];
  const nextRound = state.round + 1;
  const nextProfile = nextRound < state.totalRounds ? profiles[nextRound] : null;

  const newState: GameState & { _profiles?: Profile[] } = {
    ...state,
    balance: Math.max(0, state.balance + totalChange),
    round: nextRound,
    history: [...state.history, result],
    currentProfile: nextProfile,
    currentBet: null,
    streak: newStreak,
    multiplier: newMultiplier,
    _profiles: profiles,
  };

  return { newState, result };
}

export function isGameOver(state: GameState): boolean {
  return state.round >= state.totalRounds || (state.balance <= 0 && !state.currentBet);
}

export function getFinalScore(state: GameState): {
  totalProfit: number;
  winRate: number;
  matchRate: number;
  bestStreak: number;
  rank: string;
} {
  const totalProfit = state.balance - STARTING_BALANCE;
  const wins = state.history.filter(
    (r) => r.balanceChange + r.betResult > 0
  ).length;
  const winRate = state.history.length > 0 ? (wins / state.history.length) * 100 : 0;
  const matches = state.history.filter((r) => r.isMatch).length;
  const matchRate = state.history.length > 0 ? (matches / state.history.length) * 100 : 0;

  // Calculate best streak
  let bestStreak = 0;
  let currentStreak = 0;
  for (const r of state.history) {
    if (r.balanceChange + r.betResult > 0) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Rank based on profit
  let rank: string;
  if (totalProfit >= 500) rank = 'Game Theory God';
  else if (totalProfit >= 300) rank = 'Nash Equilibrium Master';
  else if (totalProfit >= 150) rank = 'Strategic Genius';
  else if (totalProfit >= 50) rank = 'Clever Player';
  else if (totalProfit >= 0) rank = 'Survivor';
  else if (totalProfit >= -100) rank = 'Heartbroken Gambler';
  else if (totalProfit >= -300) rank = 'Love Fool';
  else rank = 'Bankruptcy of the Heart';

  return { totalProfit, winRate, matchRate, bestStreak, rank };
}
