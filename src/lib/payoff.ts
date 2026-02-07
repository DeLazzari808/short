import { GameOutcome, PayoffMatrix, SwipeAction } from '@/types/game';

// Payoff matrix inspired by Prisoner's Dilemma / Battle of the Sexes
// Like = Cooperate, Reject = Defect
//
// The twist: Getting rejected when you liked = biggest loss (vulnerability punished)
//            Rejecting someone who liked you = moderate gain (exploiting vulnerability)
//            Mutual match = both gain nicely (cooperation reward)
//            Mutual reject = small loss for both (missed opportunity cost)

export const PAYOFF_MATRIX: PayoffMatrix = {
  mutual_match: { me: 50, them: 50 },           // Both win! Cooperation rewarded
  mutual_reject: { me: -10, them: -10 },         // Both lose a little - missed opportunity
  i_liked_they_rejected: { me: -40, them: 25 },  // I'm vulnerable, they exploit
  i_rejected_they_liked: { me: 25, them: -40 },  // I exploit their vulnerability
};

export function getOutcome(myAction: SwipeAction, theirAction: SwipeAction): GameOutcome {
  if (myAction === 'like' && theirAction === 'like') return 'mutual_match';
  if (myAction === 'reject' && theirAction === 'reject') return 'mutual_reject';
  if (myAction === 'like' && theirAction === 'reject') return 'i_liked_they_rejected';
  return 'i_rejected_they_liked';
}

export function getPayoff(myAction: SwipeAction, theirAction: SwipeAction): number {
  const outcome = getOutcome(myAction, theirAction);
  return PAYOFF_MATRIX[outcome].me;
}

export function calculateBetResult(
  prediction: 'will_like_me' | 'will_reject_me',
  theirAction: SwipeAction,
  betAmount: number
): number {
  const correct =
    (prediction === 'will_like_me' && theirAction === 'like') ||
    (prediction === 'will_reject_me' && theirAction === 'reject');

  // Correct prediction = 2x return, wrong = lose the bet
  return correct ? betAmount * 2 : -betAmount;
}

// Nash Equilibrium analysis hint for the player
export function getNashHint(personality: string): string {
  switch (personality) {
    case 'aggressive':
      return 'Tends to like everyone - rejecting them is profitable but risky';
    case 'cautious':
      return 'Very selective - they probably won\'t like you back';
    case 'random':
      return 'Unpredictable - pure gamble, go with your gut';
    case 'mirror':
      return 'Rumor has it they match your energy...';
    case 'contrarian':
      return 'Always does the opposite of what you\'d expect';
    default:
      return 'No intel available';
  }
}
