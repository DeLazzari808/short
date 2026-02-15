export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string; // gradient CSS
  distance: string;
  interests: string[];
  verified: boolean;
}

// Alias for compatibility
export type SwipeableProfile = UserProfile;

export type SwipeDirection = 'like' | 'pass';

export type PredictionType =
  | 'match'       // eu acho que vai dar match
  | 'no_match'    // eu acho que NÃO vai dar match
  | 'they_like'   // eu acho que ela vai me dar like
  | 'they_pass';  // eu acho que ela vai me dar pass

export interface Prediction {
  id: string;
  profileId: string;
  profileName: string;
  type: PredictionType;
  pointsStaked: number;
  timestamp: number;
  resolved: boolean;
  correct: boolean | null;
  pointsEarned: number | null;
}

export interface SwipeRecord {
  id: string;
  profile: UserProfile;
  myAction: SwipeDirection;
  theirAction: SwipeDirection;
  prediction: Prediction | null;
  isMatch: boolean;
  timestamp: number;
}

export interface DigitalAsset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  priceInPoints: number;
  category: 'crypto' | 'nft' | 'token';
  description: string;
  available: boolean;
}

export interface WalletState {
  points: number;
  totalEarned: number;
  totalSpent: number;
  assets: PurchasedAsset[];
}

export interface PurchasedAsset {
  asset: DigitalAsset;
  quantity: number;
  purchasedAt: number;
  pointsSpent: number;
}

export interface AppState {
  wallet: WalletState;
  predictions: Prediction[];
  swipeHistory: SwipeRecord[];
  currentProfileIndex: number;
  profiles: UserProfile[];
  streak: number;
  level: number;
  xp: number;
}
