'use client';

import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { SwipeRecord, PredictionType, SwipeDirection } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import PredictionPanel from '@/components/PredictionPanel';
import SwipeResult from '@/components/SwipeResult';
import TopBar from '@/components/TopBar';
import { Heart } from 'lucide-react';

type Phase = 'ready' | 'showing_result';

export default function HomePage() {
  const { state, predict, swipe } = useApp();
  const [phase, setPhase] = useState<Phase>('ready');
  const [lastResult, setLastResult] = useState<SwipeRecord | null>(null);
  // Key to force remount ProfileCard on each new profile
  const [cardKey, setCardKey] = useState(0);

  const currentProfile = state.profiles[state.currentProfileIndex];
  const hasPendingPrediction = state.predictions.some(
    (p) => currentProfile && p.profileId === currentProfile.id && !p.resolved
  );

  const handlePredict = useCallback((type: PredictionType, staked: number) => {
    predict(type, staked);
  }, [predict]);

  // Called AFTER the card has animated out
  const handleSwipe = useCallback((direction: SwipeDirection) => {
    const record = swipe(direction);
    setLastResult(record);
    setPhase('showing_result');
  }, [swipe]);

  const handleContinue = useCallback(() => {
    setLastResult(null);
    setPhase('ready');
    setCardKey((k) => k + 1);
  }, []);

  // No more profiles
  if (!currentProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar points={state.wallet.points} streak={state.streak} xp={state.xp} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <Heart size={64} className="text-neutral-700" />
          <h2 className="text-2xl font-bold text-white">Acabaram os perfis!</h2>
          <p className="text-neutral-500 text-sm">Volte depois para mais perfis ou confira seus pontos na Wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar points={state.wallet.points} streak={state.streak} xp={state.xp} />

      {/* Card area */}
      <div className="flex-1 flex flex-col px-4 gap-3">
        <div className="relative flex-1 min-h-[420px]">
          {phase === 'ready' && (
            <ProfileCard
              key={cardKey}
              profile={currentProfile}
              onSwipe={handleSwipe}
              disabled={false}
            />
          )}
        </div>

        {/* Prediction panel - only when card is visible */}
        {phase === 'ready' && (
          <div className="pb-4">
            <PredictionPanel
              points={state.wallet.points}
              hasPrediction={hasPendingPrediction}
              profileName={currentProfile.name}
              onPredict={handlePredict}
              onSkip={() => {}}
            />
          </div>
        )}
      </div>

      {/* Result overlay */}
      {phase === 'showing_result' && lastResult && (
        <SwipeResult record={lastResult} onContinue={handleContinue} />
      )}
    </div>
  );
}
