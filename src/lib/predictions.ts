import { PredictionType, SwipeDirection } from '@/types';

// Odds para cada tipo de prediction
const PREDICTION_ODDS: Record<PredictionType, number> = {
  match: 2.5,       // Difícil acertar = paga mais
  no_match: 1.3,    // Fácil acertar = paga menos
  they_like: 1.8,   // Médio
  they_pass: 1.5,   // Médio-fácil
};

export function getPredictionOdds(type: PredictionType): number {
  return PREDICTION_ODDS[type];
}

export function resolvePrediction(
  predictionType: PredictionType,
  myAction: SwipeDirection,
  theirAction: SwipeDirection,
  staked: number
): { correct: boolean; earned: number } {
  const isMatch = myAction === 'like' && theirAction === 'like';

  let correct = false;

  switch (predictionType) {
    case 'match':
      correct = isMatch;
      break;
    case 'no_match':
      correct = !isMatch;
      break;
    case 'they_like':
      correct = theirAction === 'like';
      break;
    case 'they_pass':
      correct = theirAction === 'pass';
      break;
  }

  const odds = PREDICTION_ODDS[predictionType];
  const earned = correct ? Math.round(staked * odds) : -staked;

  return { correct, earned };
}

// Pontos base por ação (sem prediction)
export function getBasePoints(myAction: SwipeDirection, theirAction: SwipeDirection): number {
  const isMatch = myAction === 'like' && theirAction === 'like';
  if (isMatch) return 10;       // Match = sempre ganha um pouco
  if (myAction === 'pass') return 2; // Pass = ganha pouco só por participar
  return 0; // Deu like e tomou fora = 0 base
}

export function getStreakBonus(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 5) return 3;
  if (streak >= 3) return 1;
  return 0;
}

export function calculateLevel(xp: number): { level: number; progress: number; nextLevelXp: number } {
  // XP needed: level * 100
  let level = 1;
  let remainingXp = xp;
  while (remainingXp >= level * 100) {
    remainingXp -= level * 100;
    level++;
  }
  const nextLevelXp = level * 100;
  const progress = remainingXp / nextLevelXp;
  return { level, progress, nextLevelXp };
}
