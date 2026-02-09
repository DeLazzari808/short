import { AppState, DigitalAsset, Prediction, PredictionType, PurchasedAsset, SwipeDirection, SwipeRecord } from '@/types';
import { generateProfiles, simulateTheirAction } from './profiles';
import { calculateLevel, getBasePoints, getStreakBonus, resolvePrediction } from './predictions';

const INITIAL_POINTS = 100;

export function createInitialState(): AppState {
  return {
    wallet: {
      points: INITIAL_POINTS,
      totalEarned: INITIAL_POINTS,
      totalSpent: 0,
      assets: [],
    },
    predictions: [],
    swipeHistory: [],
    currentProfileIndex: 0,
    profiles: generateProfiles(50),
    streak: 0,
    level: 1,
    xp: 0,
  };
}

export function makePrediction(
  state: AppState,
  type: PredictionType,
  staked: number
): AppState {
  const profile = state.profiles[state.currentProfileIndex];
  if (!profile || staked > state.wallet.points || staked <= 0) return state;

  const prediction: Prediction = {
    id: `pred-${Date.now()}`,
    profileId: profile.id,
    profileName: profile.name,
    type,
    pointsStaked: staked,
    timestamp: Date.now(),
    resolved: false,
    correct: null,
    pointsEarned: null,
  };

  return {
    ...state,
    predictions: [...state.predictions, prediction],
  };
}

export function performSwipe(
  state: AppState,
  myAction: SwipeDirection
): { state: AppState; record: SwipeRecord } {
  const profile = state.profiles[state.currentProfileIndex];
  const theirAction = simulateTheirAction();
  const isMatch = myAction === 'like' && theirAction === 'like';

  // Find unresolved prediction for this profile
  const predictionIdx = state.predictions.findIndex(
    (p) => p.profileId === profile.id && !p.resolved
  );

  let prediction: Prediction | null = null;
  let predictionEarned = 0;
  const updatedPredictions = [...state.predictions];

  if (predictionIdx >= 0) {
    const pred = updatedPredictions[predictionIdx];
    const result = resolvePrediction(pred.type, myAction, theirAction, pred.pointsStaked);
    prediction = {
      ...pred,
      resolved: true,
      correct: result.correct,
      pointsEarned: result.earned,
    };
    updatedPredictions[predictionIdx] = prediction;
    predictionEarned = result.earned;
  }

  // Base points
  const basePoints = getBasePoints(myAction, theirAction);
  const streakBonus = getStreakBonus(state.streak);
  const totalPointsChange = basePoints + streakBonus + predictionEarned;

  // Streak
  const newStreak = (predictionEarned > 0 || isMatch) ? state.streak + 1 : 0;

  // XP
  const xpGained = Math.max(5, basePoints + (prediction?.correct ? 15 : 0));
  const newXp = state.xp + xpGained;
  const { level } = calculateLevel(newXp);

  const record: SwipeRecord = {
    id: `swipe-${Date.now()}`,
    profile,
    myAction,
    theirAction,
    prediction,
    isMatch,
    timestamp: Date.now(),
  };

  const earned = Math.max(0, totalPointsChange);
  const spent = Math.abs(Math.min(0, totalPointsChange));

  return {
    state: {
      ...state,
      wallet: {
        ...state.wallet,
        points: Math.max(0, state.wallet.points + totalPointsChange),
        totalEarned: state.wallet.totalEarned + earned,
        totalSpent: state.wallet.totalSpent + spent,
      },
      predictions: updatedPredictions,
      swipeHistory: [record, ...state.swipeHistory],
      currentProfileIndex: state.currentProfileIndex + 1,
      streak: newStreak,
      level,
      xp: newXp,
    },
    record,
  };
}

export function purchaseAsset(
  state: AppState,
  asset: DigitalAsset
): AppState | null {
  if (state.wallet.points < asset.priceInPoints) return null;

  const existingIdx = state.wallet.assets.findIndex(
    (a) => a.asset.id === asset.id
  );

  let newAssets: PurchasedAsset[];
  if (existingIdx >= 0) {
    newAssets = [...state.wallet.assets];
    newAssets[existingIdx] = {
      ...newAssets[existingIdx],
      quantity: newAssets[existingIdx].quantity + 1,
      pointsSpent: newAssets[existingIdx].pointsSpent + asset.priceInPoints,
    };
  } else {
    newAssets = [
      ...state.wallet.assets,
      {
        asset,
        quantity: 1,
        purchasedAt: Date.now(),
        pointsSpent: asset.priceInPoints,
      },
    ];
  }

  return {
    ...state,
    wallet: {
      ...state.wallet,
      points: state.wallet.points - asset.priceInPoints,
      totalSpent: state.wallet.totalSpent + asset.priceInPoints,
      assets: newAssets,
    },
  };
}
