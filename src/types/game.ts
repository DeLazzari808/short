export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  personality: PersonalityType;
}

export type PersonalityType = 'aggressive' | 'cautious' | 'random' | 'mirror' | 'contrarian';

export type SwipeAction = 'like' | 'reject';

export type Prediction = 'will_like_me' | 'will_reject_me';

export interface BetPlacement {
  prediction: Prediction;
  amount: number;
}

export interface RoundResult {
  profile: Profile;
  myAction: SwipeAction;
  theirAction: SwipeAction;
  bet: BetPlacement | null;
  balanceChange: number;
  betResult: number;
  isMatch: boolean;
  isMutualReject: boolean;
}

export type GameOutcome = 'mutual_match' | 'mutual_reject' | 'i_liked_they_rejected' | 'i_rejected_they_liked';

export interface GameState {
  balance: number;
  round: number;
  totalRounds: number;
  history: RoundResult[];
  currentProfile: Profile | null;
  currentBet: BetPlacement | null;
  streak: number;
  multiplier: number;
}

export interface PayoffMatrix {
  mutual_match: { me: number; them: number };
  mutual_reject: { me: number; them: number };
  i_liked_they_rejected: { me: number; them: number };
  i_rejected_they_liked: { me: number; them: number };
}
